import { isReadonly, shallowReadonly } from "../reactive"

describe("shallowReadonly", () => {
  it("", () => {
    const props = shallowReadonly({
      n: { foo: 1 }
    })
    expect(isReadonly(props)).toBe(true)
    expect(isReadonly(props.n)).toBe(false)
    
  })
})