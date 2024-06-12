import { effect } from "../reactivity"
import { EMPTY_OBJ, isObject } from "../shared"
import { ShapeFlags } from "../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {

  const {
    createElement: hostCreateElement,
    patchProps: hostPatchProps,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText
  } = options


  function render(vnode, container) {
    // debugger
    patch(null, vnode, container, null, null)
  }


  function patch(n1, n2, container: any, parentComponent: null, anchor) {
    // todo 判断类型 执行对应的process函数
    // 根据vnode.type的类型判断 element 和 component
    const { type, shapeFlag } = n2

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break;
      case Text:
        processText(n1, n2, container)
        break;

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor)
        }
        break;
    }

  }

  function processComponent(n1, n2: any, container: any, parentComponent, anchor) {
    mountComponent(n2, container, parentComponent, anchor)
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    // todo 更新内容
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ

    // const el = n1.el
    const el = (n2.el = n1.el)

    patchChildren(n1, n2, el, parentComponent, anchor)

    patchProps(el, oldProps, newProps)
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag
    const c1 = n1.children
    const shapeFlag = n2.shapeFlag
    const c2 = n2.children
    // console.log('n1= ', n1, ' n2= ', n2, ' container= ', container)
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // array => text
      if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        /**
         * 1、把array清空
         * 2、设置text
         */
        unmountChildren(n1.children)
      }
      if(c1 !== c2) {
        hostSetElementText(container, c2)
      }
    } else {
      if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        /**
         * 1、清空文本节点
         * 2、添加array
         */
        hostSetElementText(container, '')
        mountChildren(c2, container, parentComponent, anchor)
      } else {
        // array diff array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
    let i = 0
    let l2 = c2.length
    let e1 = c1.length - 1
    let e2 = l2 - 1

    function isSameVnodeType(n1, n2) {
      // 通过type 和 key判断 vnode是否一致
      return n1.type === n2.type && n1.key === n2.key
    }

    // 1、左侧对比
    while(i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if(isSameVnodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      i++
    }

    // 2、右侧对比
    while(i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]

      if(isSameVnodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }

      e1--
      e2--
    }

    /**
     * 1、新的数组元素大于老的数组元素 需要创建新的元素
     * 
     */
    if(i > e1) {
      if(i <= e2) {
        const nextPos = e2 + 1;
        // const anchor = ((i + 1) > c2.length) ? null : c2[nextPos].el
        const anchor = (nextPos < l2) ? c2[nextPos].el : null
        console.log("================== ", parentAnchor, anchor)
        while(i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    } else if(i > e2) {
      while(i <= e1) {
        hostRemove(c1[i].el)
        i++
      }
    }
  }

  function unmountChildren(children) {
    // console.log("unmountChildren========= ", children)
    for(let i = 0; i < children.length; i++) {
      const el = children[i].el
      hostRemove(el)
    }
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key]
        const newProp = newProps[key]

        if (prevProp !== newProp) {
          hostPatchProps(el, key, prevProp, newProp)
        }
      }

      if(oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProps(el, key, oldProps[key], null)
          }
        }
      }
    }

  }

  function mountComponent(initialVNode: any, container, parentComponent, anchor) {
    const instance = createComponentInstance(initialVNode, parentComponent)
    // 将数据添加到instance上
    setupComponent(instance)

    setupRenderEffect(instance, initialVNode, container, anchor)
  }

  function mountElement(vnode: any, container: any, parentComponent, anchor) {
    const el = (vnode.el = hostCreateElement(vnode.type))
    const { children, props, shapeFlag } = vnode

    // todo children会有两种类型 string和array
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor)
    }

    for (const key in props) {
      const val = props[key]
      hostPatchProps(el, key, null, val)
    }

    hostInsert(el, container, anchor)
  }

  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach(v => {
      patch(null, v, container, parentComponent, anchor)
    })
  }

  // 
  function setupRenderEffect(instance: any, initialVNode, container, anchor) {
    effect(() => {
      if (!instance.isMounted) {
        // console.log('init=========== ')
        const { proxy } = instance
        // subTree：组件内容的vnode对象
        const subTree = (instance.subTree = instance.render.call(proxy))
        patch(null, subTree, container, instance, anchor)

        // 对el进行赋值
        initialVNode.el = subTree.el

        instance.isMounted = true
      } else {
        // console.log('update=========== ')
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree

        patch(prevSubTree, subTree, container, instance, anchor)
      }

    })
  }

  function processFragment(n1, n2, container: any, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor)
  }

  function processText(n1, n2, container: any) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }

  return {
    createApp: createAppApi(render)
  }
}
