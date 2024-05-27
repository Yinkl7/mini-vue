import { computed } from "../computed"
import { reactive } from "../reactive"

describe('computed', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    })

    const age = computed(() => {
      return user.age
    })

    expect(age.value).toBe(10)
  })

  it('should compute lazily', () => {
    const value = reactive({
      foo: 1
    })

    const getter = jest.fn(() => {
      return value.foo
    })

    const cValue = computed(getter)

    expect(getter).not.toHaveBeenCalled()

    expect(cValue.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(1)

    // 再次触发 不应该执行getter函数
    cValue.value
    expect(getter).toHaveBeenCalledTimes(1)

    value.foo = 2
    expect(getter).toHaveBeenCalledTimes(1)

    expect(cValue.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(2)

    cValue.value
    expect(getter).toHaveBeenCalledTimes(2)
  })
})