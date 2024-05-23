import { track, trigger } from "./effect"
import { ReactiveFlags } from "./reactive"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter(isReadonly = false) {
  return function(target, key) {
    const res = Reflect.get(target, key)

    if(key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if(key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }
      // 收集依赖
    if(!isReadonly) {
      track(target, key)
    }
    return res
  }
}

function createSetter() {
  return function(target, key, value) {
    const res = Reflect.set(target, key, value)
    // 触发依赖
    trigger(target, key)
    return res
  }
}

export const mutableHandlers = {
  get,
  set
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    // todo 抛出异常提示
    console.warn(`${key} 无法被修改，因为是readonly`, target)
    return true
  }
}
