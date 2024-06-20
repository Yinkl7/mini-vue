import { describe, expect, it, vi } from 'vitest'
import { reactive } from '@guide-mini-vue/reactivity'
import { nextTick } from '../src/schduler'
import { watchEffect } from '../src/apiWatch'

describe('apiWatch',() => {
  it('effect', async () => {
    const state = reactive({ count: 0 })

    let dummy
    watchEffect(() => {
      dummy = state.count
    })
    expect(dummy).toBe(0)

    state.count++
    await nextTick()
    expect(dummy).toBe(1)
  })

  it('stop watch', async () => {
    const state = reactive({ count: 0 })

    let dummy
    const stop: () => void = watchEffect(() => {
      dummy = state.count
    })
    expect(dummy).toBe(0)

    stop()
    state.count++
    await nextTick()
    expect(dummy).toBe(0)
  })

  it('cleanup registration', async () => {
    const state = reactive({ count: 0 })
    const cleanup = vi.fn()
    let dummy
    const stop: () => void = watchEffect((onCleanup) => {
      onCleanup(cleanup)
      dummy = state.count
    })
    expect(dummy).toBe(0)

    state.count++
    await nextTick()
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(1)

    stop()
    expect(cleanup).toHaveBeenCalledTimes(2)
  })
})
