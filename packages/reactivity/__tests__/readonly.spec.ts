import { readonly, isReadonly, isProxy } from "../src/reactive"
import { vi } from 'vitest'

describe("readonly", () => {
  it("happy path", () => {
    const original = { foo: 1 }
    const observed = readonly(original)
    expect(observed).not.toBe(original)
    expect(observed.foo).toBe(1)
    expect(isReadonly(observed)).toBe(true)
    expect(isReadonly(original)).toBe(false)
    expect(isProxy(observed)).toBe(true)
  }),

  it("call set", () => {
    console.warn = vi.fn()

    const user = readonly({
      age: 10
    })

    user.age = 11

    expect(console.warn).toBeCalled()
  })

  it("nested readonly", () => {
    const original = {
      nested: {
        foo: 1
      },
      array: [{ bar: 2 }]
    }
    const observed = readonly(original)
    expect(isReadonly(observed.nested)).toBe(true)
    expect(isReadonly(observed.array)).toBe(true)
    expect(isReadonly(observed.array[0])).toBe(true)
  })
})