import { readonly, isReadonly } from "../reactive"

describe("readonly", () => {
  it("happy path", () => {
    const original = { foo: 1 }
    const observed = readonly(original)
    expect(observed).not.toBe(original)
    expect(observed.foo).toBe(1)
    expect(isReadonly(observed)).toBe(true)
    expect(isReadonly(original)).toBe(false)
  }),

  it("call set", () => {
    console.warn = jest.fn()

    const user = readonly({
      age: 10
    })

    user.age = 11

    expect(console.warn).toBeCalled()
  })
})