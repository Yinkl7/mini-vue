import { track, trigger } from './effect'

export function reactive(raw) {
  return new Proxy(raw, {
    get(raw, key) {
      const res = Reflect.get(raw, key)
      // track 追踪依赖
      track(raw, key)
      return res
    },
    set(raw, key, value) {
      const res = Reflect.set(raw, key, value)

      // trigger 触发依赖
      trigger(raw, key)
      return res
    }
  })
}
