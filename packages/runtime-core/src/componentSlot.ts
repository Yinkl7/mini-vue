/**
 * 1、children为对象和数组的处理
 * 2、具名插槽是一个对象的处理
 */

import { ShapeFlags } from "@guide-mini-vue/shared"

export function initSlots(instance, children) {
  const { vnode } = instance
  if(vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(children, instance.slots)
  }
}

function normalizeObjectSlots(children: any, slots: any) {
  for(const key in children) {
    const value = children[key]
    slots[key] = (props) => normalizeSlotValue(value(props))
  }
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value]
}
