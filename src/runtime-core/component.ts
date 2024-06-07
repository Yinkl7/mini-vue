import { isObject } from "../shared"

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type
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

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type

  if(Component.render) {
    instance.render = Component.render
  }
}

