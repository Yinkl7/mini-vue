import { shallowReadonly } from "../reactivity/reactive"
import { isObject } from "../shared/index"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { PublicInstanceHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlot"

export function createComponentInstance(vnode, parent) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
    provides: parent ? parent.provides : {},
    parent,
    emit: () => {}
  }

  console.log('createComponentInstance: ', parent, component)

  component.emit = emit.bind(null, component) as any

  return component
}

export function setupComponent(instance) {
  // todo 
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)
  setupStatefulComponent(instance)
}


function setupStatefulComponent(instance: any) {
  const Component = instance.vnode.type

  // 生成组件代理对象，访问this时直接访问这个代理对象
  instance.proxy = new Proxy({ _: instance}, PublicInstanceHandlers)

  const { setup } = Component
  
  if(setup) {
    setCurrentInstance(instance)
    const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit })
    setCurrentInstance(null)
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult: any) {
  // setup 返回值可能是function或者是object
  // todo function
  if(isObject(setupResult)) {
    instance.setupState = setupResult
  }

  // 将render函数添加到组件实例上
  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type

  // if(Component.render) {
    instance.render = Component.render
  // }
}

let currentInstance = null

export function getCurrentInstance() {
  return currentInstance
}

function setCurrentInstance(instance) {
  currentInstance = instance
}
