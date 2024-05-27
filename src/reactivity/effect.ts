import { extend } from '../shared'

let activeEffect;
let shouldTrack;
export class ReactiveEffect {
  private _fn: any;
  // deps 是保存当前effect的Set对象
  deps = []
  // 防止频繁调用 stop
  active = true
  onStop?: () => void

  constructor(fn, public scheduler?) {
    this._fn = fn
  }

  run() {
    // activeEffect = this
    // return this._fn()
    // stop的情况
    if(!this.active) {
      return this._fn()
    }
    // 没有stop的情况
    shouldTrack = true
    activeEffect = this
    // 执行 this._fn() 时做依赖收集
    const result = this._fn()
    shouldTrack = false
    return result
  }

  stop() {
    if(this.active) {
      cleanUpEffect(this)
      if(this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

function cleanUpEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
  effect.deps.length = 0
}

let targetMap = new WeakMap()

export function track(target, key) {
  // target => key => dep

  if(!isTracking()) return

  let depsMap = targetMap.get(target)
  if(!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if(!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  trackEffects(dep)
}

export function trackEffects(dep) {
  if(dep.has(activeEffect)) return
  // 添加effect
  dep.add(activeEffect)

  // 保存所有包含当前effect的dep
  activeEffect.deps.push(dep)
}

export function isTracking() {
  // activeEffect: 不使用 effect 函数时，不存在activeEffect
  // shouldTrack: 不应该被触发依赖
  return shouldTrack && activeEffect !== undefined
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)
  // for(const effect of dep) {
  //   if(effect.scheduler) {
  //     effect.scheduler()
  //   } else {
  //     effect.run()
  //   }
  // }
  triggerEffects(dep)
}

export function triggerEffects(dep) {
  for(const effect of dep) {
    if(effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  // _effect.onStop = options.onStop
  extend(_effect, options)
  _effect.run()

  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect

  return runner
}

// stop函数：删除dep中的effect
export function stop(runner) {
  runner.effect.stop()
}
