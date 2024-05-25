import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect"
import { reactive } from "./reactive";

/**
 * 简单的数据类型的get和set很难被收集，
 * 增加ref类，通过value属性触发get和set从而收集、触发依赖
 */
class RefImpl {
  private _value: any;
  public dep;
  private _rawValue: any;
  constructor(value) {
    this._rawValue = value
    // 判断是否是对象
    this._value = convert(value)
    this.dep = new Set() 
  }

  get value() {
    // 依赖收集
    trackRefVal(this)
    return this._value
  }

  set value(newVal) {
    if(hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = convert(newVal)
      triggerEffects(this.dep)
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value
}

function trackRefVal(ref) {
  if(isTracking()) {
    trackEffects(ref.dep)
  }
}

export function ref(value) {
  return new RefImpl(value)
}