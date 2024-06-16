const extend = Object.assign;
const EMPTY_OBJ = {};
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const hasChanged = (val, newVal) => {
    return !Object.is(val, newVal);
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
// 烤串变驼峰
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};
// 首字母大写
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
// 事件字符添加on
const toHandlerKey = (str) => {
    return str ? `on${capitalize(str)}` : '';
};

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        // deps 是保存当前effect的Set对象
        this.deps = [];
        // 防止频繁调用 stop
        this.active = true;
        this._fn = fn;
    }
    run() {
        // activeEffect = this
        // return this._fn()
        // stop的情况
        if (!this.active) {
            return this._fn();
        }
        // 没有stop的情况
        shouldTrack = true;
        activeEffect = this;
        // 执行 this._fn() 时做依赖收集
        const result = this._fn();
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            cleanUpEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanUpEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
let targetMap = new WeakMap();
function track(target, key) {
    // target => key => dep
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    if (dep.has(activeEffect))
        return;
    // 添加effect
    dep.add(activeEffect);
    // 保存所有包含当前effect的dep
    activeEffect.deps.push(dep);
}
function isTracking() {
    // activeEffect: 不使用 effect 函数时，不存在activeEffect
    // shouldTrack: 不应该被触发依赖
    return shouldTrack && activeEffect !== undefined;
}
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    // for(const effect of dep) {
    //   if(effect.scheduler) {
    //     effect.scheduler()
    //   } else {
    //     effect.run()
    //   }
    // }
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // _effect.onStop = options.onStop
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function (target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        }
        else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        // 确保嵌套的对象也是 reactive 或 readonly的
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        // 收集依赖
        if (!isReadonly) {
            track(target, key);
        }
        return res;
    };
}
function createSetter() {
    return function (target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        // todo 抛出异常提示
        console.warn(`${key} 无法被修改，因为是readonly`, target);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, { get: shallowReadonlyGet });

var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlags["IS_READONLY"] = "__v_isReadonly";
})(ReactiveFlags || (ReactiveFlags = {}));
function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function createActiveObject(target, baseHandlers) {
    if (!isObject(target)) {
        console.warn(`target ${target} 必须是一个对象`);
        return;
    }
    return new Proxy(target, baseHandlers);
}

/**
 * 简单的数据类型的get和set很难被收集，
 * 增加ref类，通过value属性触发get和set从而收集、触发依赖
 */
class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        // 判断是否是对象
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        // 依赖收集
        trackRefVal(this);
        return this._value;
    }
    set value(newVal) {
        if (hasChanged(newVal, this._rawValue)) {
            this._rawValue = newVal;
            this._value = convert(newVal);
            triggerEffects(this.dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefVal(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRef(object) {
    return new Proxy(object, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
    ShapeFlags[ShapeFlags["SLOT_CHILDREN"] = 16] = "SLOT_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));

function emit(instance, event, ...args) {
    console.log('emit add');
    const { props } = instance;
    // add => Add
    // add-foo => AddFoo
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props,
};
const PublicInstanceHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // if(key === '$el') {
        //   return instance.vnode.el
        // }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

/**
 * 1、children为对象和数组的处理
 * 2、具名插槽是一个对象的处理
 */
function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        // 要更新的vnode
        next: null,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {},
        emit: () => { }
    };
    // console.log('createComponentInstance: ', parent, component)
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // todo 
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.vnode.type;
    // 生成组件代理对象，访问this时直接访问这个代理对象
    instance.proxy = new Proxy({ _: instance }, PublicInstanceHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // setup 返回值可能是function或者是object
    // todo function
    if (isObject(setupResult)) {
        instance.setupState = proxyRef(setupResult);
    }
    // 将render函数添加到组件实例上
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    // if(Component.render) {
    instance.render = Component.render;
    // }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function shoudUpdateComponent(prevVNode, nextVNode) {
    const { props: prevProps } = prevVNode;
    const { props: nextProps } = nextVNode;
    for (const key in nextProps) {
        if (nextProps[key] !== prevProps[key]) {
            return true;
        }
    }
    return false;
}

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVnode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        // 组件实例
        component: null,
        shapeFlag: getShapeFlag(type),
        key: props && props.key,
        el: null
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }
    // 判断插槽 组件 + children为object
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if (isObject(children)) {
            vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
        }
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}
function createTextVnode(text) {
    return createVnode(Text, {}, text);
}

function createAppApi(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const vnode = createVnode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

const queue = [];
let isFlashPending = false;
const p = Promise.resolve();
function nextTick(fn) {
    return fn ? p.then(fn) : p;
}
function queueJobs(job) {
    if (!queue.includes(job)) {
        queue.push(job);
    }
    queueFlush();
}
function queueFlush() {
    if (isFlashPending)
        return;
    isFlashPending = true;
    nextTick(flushJobs);
}
function flushJobs() {
    isFlashPending = false;
    let job;
    while ((job = queue.shift())) {
        job && job();
    }
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProps: hostPatchProps, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options;
    function render(vnode, container) {
        // debugger
        patch(null, vnode, container, null, null);
    }
    function patch(n1, n2, container, parentComponent, anchor) {
        // todo 判断类型 执行对应的process函数
        // 根据vnode.type的类型判断 element 和 component
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }
    function processComponent(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountComponent(n2, container, parentComponent, anchor);
        }
        else {
            updateComponent(n1, n2);
        }
    }
    function updateComponent(n1, n2) {
        const instance = (n2.component = n1.component);
        if (shoudUpdateComponent(n1, n2)) {
            // 组件的更新本质就是调用update函数
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            instance.vnode = n2;
        }
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        // todo 更新内容
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        // const el = n1.el
        const el = (n2.el = n1.el);
        patchChildren(n1, n2, el, parentComponent, anchor);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const prevShapeFlag = n1.shapeFlag;
        const c1 = n1.children;
        const shapeFlag = n2.shapeFlag;
        const c2 = n2.children;
        // console.log('n1= ', n1, ' n2= ', n2, ' container= ', container)
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // array => text
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                /**
                 * 1、把array清空
                 * 2、设置text
                 */
                unmountChildren(n1.children);
            }
            if (c1 !== c2) {
                hostSetElementText(container, c2);
            }
        }
        else {
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                /**
                 * 1、清空文本节点
                 * 2、添加array
                 */
                hostSetElementText(container, '');
                mountChildren(c2, container, parentComponent, anchor);
            }
            else {
                // array diff array
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        let i = 0;
        let l2 = c2.length;
        let e1 = c1.length - 1;
        let e2 = l2 - 1;
        function isSameVnodeType(n1, n2) {
            // 通过type 和 key判断 vnode是否一致
            return n1.type === n2.type && n1.key === n2.key;
        }
        // 1、左侧对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVnodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            i++;
        }
        // 2、右侧对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVnodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        /**
         * 1、新的数组元素大于老的数组元素 需要创建新的元素
         *
         */
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                // const anchor = ((i + 1) > c2.length) ? null : c2[nextPos].el
                const anchor = (nextPos < l2) ? c2[nextPos].el : null;
                // console.log("================== ", parentAnchor, anchor)
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            /**
             * 1、新的节点的key和index生成一个映射关系 keyToNewIndexMap
             * 2、通过初始一个长度为新元素长度且元素为0的数组 newIndexToOldIndexMap
             * 3、遍历老节点
             *  3.1、删除没有在 keyToNewIndexMap
             *  3.2、拿到 keyToNewIndexMap 中的index，表示老元素在新节点array中的位置，+1后赋值到 newIndexToOldIndexMap 中，patch新老元素
             * 4、通过 newIndexToOldIndexMap 获取最大递增子序列 increasingNewIndexSequence ，减少不必要的元素移动
             * 5、增加一个指针j，并倒叙遍历（拿到确定的元素节点作为锚点）
             *  5.1、newIndexToOldIndexMap[i] 是否为 0 ，为 0 表示该元素需要新增
             *  5.2、i == increasingNewIndexSequence[j] 表示当前 i 这个节点的元素在递增子序列中不需要移动
             *  5.3、当前节点不在递增子序列中时，根据 i 获取锚点，将该元素移动位置
             */
            // 中间对比
            let s1 = i;
            let s2 = i;
            // 待处理的和已处理的数据
            let toBePatched = e2 - s2 + 1;
            let patched = 0;
            let moved = false;
            let maxNewIndexSoFar = 0;
            // 生成映射
            const keyToNewIndexMap = new Map();
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i];
                keyToNewIndexMap.set(nextChild.key, i);
            }
            // 最长递增子序列
            const newIndexToOldIndexMap = new Array(toBePatched);
            for (let i = 0; i < toBePatched; i++) {
                // 0 表示新的节点中需要创建的元素
                newIndexToOldIndexMap[i] = 0;
            }
            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                // 如果新的数据已经被patch完；那么老数组剩余的全部应该被删除
                if (patched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }
                let newIndex;
                if (prevChild.key != null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    for (let j = s2; j <= s2; j++) {
                        if (isSameVnodeType(prevChild, c2[j])) {
                            newIndex = j;
                        }
                        else {
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    // 通过判断后一个的index是否大于前一个得出是否需要移动
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    // +1 为了避免0的情况
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    patch(prevChild, c2[newIndex], container, parentComponent, null);
                    patched++;
                }
            }
            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
            let j = increasingNewIndexSequence.length - 1;
            // 采用倒叙插入才能确定insertBefore的锚点
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2;
                const nextChild = c2[nextIndex];
                const anchor = (nextIndex + 1 < l2) ? c2[nextIndex + 1].el : null;
                // newIndexToOldIndexMap数组中为0的项表示需要添加的元素
                if (newIndexToOldIndexMap[i] == 0) {
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                else if (moved) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        // 移动位置
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function unmountChildren(children) {
        // console.log("unmountChildren========= ", children)
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const newProp = newProps[key];
                if (prevProp !== newProp) {
                    hostPatchProps(el, key, prevProp, newProp);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProps(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function mountComponent(initialVNode, container, parentComponent, anchor) {
        const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent));
        // 将数据添加到instance上
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container, anchor);
    }
    function mountElement(vnode, container, parentComponent, anchor) {
        const el = (vnode.el = hostCreateElement(vnode.type));
        const { children, props, shapeFlag } = vnode;
        // todo children会有两种类型 string和array
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children;
        }
        else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode.children, el, parentComponent, anchor);
        }
        for (const key in props) {
            const val = props[key];
            hostPatchProps(el, key, null, val);
        }
        hostInsert(el, container, anchor);
    }
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach(v => {
            patch(null, v, container, parentComponent, anchor);
        });
    }
    // 
    function setupRenderEffect(instance, initialVNode, container, anchor) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                // console.log('init=========== ')
                const { proxy } = instance;
                // subTree：组件内容的vnode对象
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance, anchor);
                // 对el进行赋值
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                // console.log('update=========== ')
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponetPreRender(instance, next);
                }
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        }, {
            scheduler() {
                console.log('update -- scheduler');
                queueJobs(instance.update);
            },
        });
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    return {
        createApp: createAppApi(render)
    };
}
function updateComponetPreRender(instance, nextVNode) {
    instance.vnode = nextVNode;
    instance.next = null;
    instance.props = nextVNode.props;
}
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            // return createVnode('div', {}, [])
            return createVnode(Fragment, {}, slot(props));
        }
    }
}

function provide(key, value) {
    var _a;
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = (_a = currentInstance === null || currentInstance === void 0 ? void 0 : currentInstance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        // init: 利用原型链的特性，不覆盖相同key的值
        if (parentProvides === provides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
/**
 *
 * @param key
 * @param defaultValue 默认值
 * @returns
 * 取父组件的值
 */
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createElement(type) {
    return document.createElement(type);
}
function patchProps(el, key, prevVal, nextVal) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextVal);
    }
    else {
        if (nextVal === null || nextVal === undefined) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function insert(child, parent, anchor) {
    // parent.append(el)
    parent.insertBefore(child, anchor || null);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProps,
    insert,
    remove,
    setElementText
});
function createApp(...args) {
    return renderer.createApp(...args);
}

export { createApp, createRenderer, createTextVnode, effect, getCurrentInstance, h, inject, nextTick, provide, proxyRef, ref, renderSlots };
