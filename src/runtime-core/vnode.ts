import { isObject } from "../shared/index"
import { ShapeFlags } from "../shared/shapeFlags"

export function createVnode(type, props?, children?) {
  const vnode = {
    type, 
    props, 
    children,
    shapeFlag: getShapeFlag(type),
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
