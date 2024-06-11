import { getCurrentInstance } from "./component";

export function provide(key, value) {
  const currentInstance: any = getCurrentInstance()
  if(currentInstance) {
    let { provides } = currentInstance

    const parentProvides = currentInstance?.parent?.provides

    // init: 利用原型链的特性，不覆盖相同key的值
    if(parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides)
    }

    provides[key] = value
  }
  
}
/**
 * 
 * @param key 
 * @param defaultValue 默认值
 * @returns 
 * 取父组件的值
 */
export function inject(key, defaultValue) {
  const currentInstance: any = getCurrentInstance()
  if(currentInstance) {
    const parentProvides = currentInstance.parent.provides
    if(key in parentProvides) {
      return parentProvides[key]
    } else if(defaultValue) {
      if(typeof defaultValue === 'function') {
        return defaultValue()
      }
      return defaultValue
    }
  }
}
