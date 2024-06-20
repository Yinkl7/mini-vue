import { createRenderer } from "@guide-mini-vue/runtime-core";

function createElement(type) {
  return document.createElement(type)
}

function patchProps(el, key, prevVal, nextVal) {
  const isOn = (key: string) => /^on[A-Z]/.test(key)
  if(isOn(key)) {
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event, nextVal)
  } else {
    if(nextVal === null || nextVal === undefined) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, nextVal)
    }
  }
}

function insert(child, parent, anchor) {
  // parent.append(el)
  parent.insertBefore(child, anchor || null)
}

function remove(child) {
  const parent = child.parentNode
  if(parent) {
    parent.removeChild(child)
  }
}

function setElementText(el, text) {
  el.textContent = text
}

const renderer: any = createRenderer({
  createElement,
  patchProps,
  insert,
  remove,
  setElementText
})

export function createApp(...args) {
  return renderer.createApp(...args)
}

export * from '@guide-mini-vue/runtime-core'
