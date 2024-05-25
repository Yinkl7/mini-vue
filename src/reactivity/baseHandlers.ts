import { extend, isObject } from "../shared"
import { track, trigger } from "./effect"
import { ReactiveFlags, reactive, readonly } from "./reactive"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter(isReadonly = false, shallow = false) {
  return function(target, key) {
    if(key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if(key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }

    const res = Reflect.get(target, key)
    
    if(shallow) {
      return res
    }

    // 确保嵌套的对象也是 reactive 或 readonly的
    if(isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
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

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, { get: shallowReadonlyGet })