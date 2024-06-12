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
    insert: hostInsert
  } = options


  function render(vnode, container) {
    // debugger
    patch(null, vnode, container, null)
  }


  function patch(n1, n2, container: any, parentComponent: null) {
    // todo 判断类型 执行对应的process函数
    // 根据vnode.type的类型判断 element 和 component
    const { type, shapeFlag } = n2

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break;
      case Text:
        processText(n1, n2, container)
        break;

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent)
        }
        break;
    }

  }

  function processComponent(n1, n2: any, container: any, parentComponent) {
    mountComponent(n2, container, parentComponent)
  }

  function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container)
    }
  }

  function patchElement(n1, n2, container) {
    console.log('patchElement')
    // todo 更新内容
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ

    // const el = n1.el
    const el = (n2.el = n1.el)

    patchProps(el, oldProps, newProps)
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

  function mountComponent(initialVNode: any, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent)
    // 将数据添加到instance上
    setupComponent(instance)

    setupRenderEffect(instance, initialVNode, container)
  }

  function mountElement(vnode: any, container: any, parentComponent) {
    const el = (vnode.el = hostCreateElement(vnode.type))
    const { children, props, shapeFlag } = vnode

    // todo children会有两种类型 string和array
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent)
    }

    for (const key in props) {
      const val = props[key]
      hostPatchProps(el, key, null, val)
    }

    hostInsert(el, container)
  }

  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach(v => {
      patch(null, v, container, parentComponent)
    })
  }

  // 
  function setupRenderEffect(instance: any, initialVNode, container) {
    effect(() => {
      if (!instance.isMounted) {
        console.log('init=========== ')
        const { proxy } = instance
        // subTree：组件内容的vnode对象
        const subTree = (instance.subTree = instance.render.call(proxy))
        patch(null, subTree, container, instance)

        // 对el进行赋值
        initialVNode.el = subTree.el

        instance.isMounted = true
      } else {
        console.log('update')
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree

        patch(prevSubTree, subTree, container, instance)
      }

    })
  }

  function processFragment(n1, n2, container: any, parentComponent) {
    mountChildren(n2, container, parentComponent)
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
