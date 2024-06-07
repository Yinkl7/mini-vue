import { isObject } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
  patch(vnode, container)
}

export function patch(vnode, container) {
  // todo 判断类型 执行对应的process函数
  // 根据vnode.type的类型判断 element 和 component
  if(typeof vnode.type === 'string') {
    processElement(vnode, container)
  } else if(isObject(vnode.type)) {
    processComponent(vnode, container)
  }
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function processElement(vnode, container) {
  mountElement(vnode, container)
}

function mountComponent(vnode: any, container) {
  const instance = createComponentInstance(vnode)

  setupComponent(instance)

  setupRenderEffect(instance, container)
}

function mountElement(vnode: any, container: any) {
  const el = document.createElement(vnode.type)
  const { children, props } = vnode

  // todo children会有两种类型 string和array
  if(typeof children === 'string') {
    el.textContent = children
  } else if(Array.isArray(children)) {
    mountChildren(vnode, el)
  }

  for(const key in props) {
    const val = props[key]
    el.setAttribute(key, val)
  }

  container.append(el)
}

function mountChildren(vnode, container) {
  vnode.children.forEach(v => {
    patch(v, container)
  })
}

function setupRenderEffect(instance: any, container) {
  const subTree = instance.render()

  patch(subTree, container)
}
