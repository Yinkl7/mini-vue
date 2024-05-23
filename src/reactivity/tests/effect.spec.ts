import { reactive } from '../reactive'
import { effect, stop } from '../effect'

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10
    })

    let nextAge;
    effect(() => {
      nextAge = user.age + 1
    })

    expect(nextAge).toBe(11)

    user.age++

    expect(nextAge).toBe(12)
  })

  // effect 返回一个runner函数
  it("return effect runner", () => {
    let foo = 10
    const runner = effect(() => {
      foo++
      return 'foo'
    })

    expect(foo).toBe(11)

    const res = runner()
    expect(foo).toBe(12)
    expect(res).toBe('foo')
  })

  // scheduler 的传递
  it("scheduler", () => {
    /**
     * 1、scheduler是effect的第二个参数 是一个function
     * 2、effect 第一次执行时 还会执行fn
     * 3、触发响应式时会执行 scheduler
     * 4、执行runner时才会执行 fn
     */

    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner
    })

    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )

    expect(scheduler).not.toHaveBeenCalled()

    expect(dummy).toBe(1)

    obj.foo++

    expect(scheduler).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(1)

    run()
    expect(dummy).toBe(2)
  })

  // stop方法
  it("stop", () => {
    /**
     * 1、stop 会停止响应式
     * 2、调用runner会触发fn
     */
    let dummy;
    let obj = reactive({ num: 10 })
    let runner = effect(() => {
      dummy = obj.num
    })

    obj.num = 12
    expect(dummy).toBe(12)
    stop(runner)
    obj.num++
    expect(dummy).toBe(12)

    runner()
    expect(dummy).toBe(13)
  })

  it("onStop", () => {
    const obj = reactive({
      foo: 1
    })

    const onStop = jest.fn()
    let dummy;

    const runner = effect(
      () => {
        dummy = obj.foo
      },
      {
        onStop
      }
    )

    stop(runner)
    expect(onStop).toHaveBeenCalledTimes(1)
  })
})
