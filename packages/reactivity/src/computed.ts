import { ReactiveEffect } from "./effect"

class ComputedRefImpl {
  private _getter: any
  private _dirty = true
  private _value: any
  private _effect: ReactiveEffect
  constructor(getter) {
    this._getter = getter

    // 只在第一次执行getter时收集依赖，当依赖修改时修改dirty，可以重新执行get操作
    this._effect = new ReactiveEffect(getter, () => {
      if(!this._dirty) {
        this._dirty = true
      }
    })
  }

  get value() {
    if(this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }
    return this._value
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter)
}
