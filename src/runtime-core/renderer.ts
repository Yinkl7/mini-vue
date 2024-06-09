import { isObject } from "../shared/index"
import { ShapeFlags } from "../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode"

export function render(vnode, container) {
  patch(vnode, container)
}

export function patch(vnode, container) {
  // todo 判断类型 执行对应的process函数
  // 根据vnode.type的类型判断 element 和 component
  const { type, shapeFlag } = vnode

  switch (type) {
    case Fragment:
      processFragment(vnode, container)
      break;
    case Text:
      processText(vnode, container)
      break;
  
    default:
      if(shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container)
      } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container)
      }
      break;
  }

}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function processElement(vnode, container) {
  mountElement(vnode, container)
}

function mountComponent(initialVNode: any, container) {
  const instance = createComponentInstance(initialVNode)
  // 将数据添加到instance上
  setupComponent(instance)

  setupRenderEffect(instance, initialVNode, container)
}

function mountElement(vnode: any, container: any) {
  const el = (vnode.el = document.createElement(vnode.type))
  const { children, props, shapeFlag } = vnode

  // todo children会有两种类型 string和array
  if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el)
  }

  for(const key in props) {
    const val = props[key]
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if(isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, val)
    } else {
      el.setAttribute(key, val)
    }
  }

  container.append(el)
}

function mountChildren(vnode, container) {
  vnode.children.forEach(v => {
    patch(v, container)
  })
}

// 
function setupRenderEffect(instance: any, initialVNode, container) {
  const { proxy } = instance
  // subTree：组件内容的vnode对象
  const subTree = instance.render.call(proxy)

  patch(subTree, container)

  // 对el进行赋值
  initialVNode.el = subTree.el
}

function processFragment(vnode: any, container: any) {
  mountChildren(vnode, container)
}

function processText(vnode: any, container: any) {
  const { children } = vnode
  const textNode = (vnode.el = document.createTextNode(children))
  container.append(textNode)
}

