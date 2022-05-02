class ReactiveEffect {
  private _fn: Function
  constructor(fn) {
    this._fn = fn
  }

  run() {
    activeEffect = this
    this._fn()
  }
}

let activeEffect;
const targetMap = new WeakMap()
// 收集依赖的本质就是 收集 ReactiveEffect
export function track(target, key) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, depsMap = new Map())
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, deps = new Set())
  }

  deps.add(activeEffect)
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const deps = depsMap.get(key)
  if (!deps) return
  deps.forEach(effect => effect.run())
}

export function effect(fn) {
  const _effect = new ReactiveEffect(fn)

  _effect.run()
}