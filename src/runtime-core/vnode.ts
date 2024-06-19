import { isObject } from "../shared"
import { ShapeFlags } from "../shared/shapeFlags"

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export { createVnode as createElementVNode }

export function createVnode(type, props?, children?) {
  const vnode = {
    type, 
    props, 
    children,
    // 组件实例
    component: null,
    shapeFlag: getShapeFlag(type),
    key: props && props.key,
    el: null
  }

  if(typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if(Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  // 判断插槽 组件 + children为object
  if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if(isObject(children)) {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }

  return vnode
}

function getShapeFlag(type: any) {
  return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}

export function createTextVnode(text: string) {
  return createVnode(Text, {}, text)
}
