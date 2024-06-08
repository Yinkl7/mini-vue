import { isObject } from "../shared/index"
import { PublicInstanceHandlers } from "./componentPublicInstance"

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
  }

  return component
}

export function setupComponent(instance) {
  // todo 
  // initProps
  // initSlots
  setupStatefulComponent(instance)
}


function setupStatefulComponent(instance: any) {
  const Component = instance.vnode.type

  // 生成组件代理对象，访问this时直接访问这个代理对象
  instance.proxy = new Proxy({ _: instance}, PublicInstanceHandlers)

  const { setup } = Component
  
  if(setup) {
    const setupResult = setup()
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

