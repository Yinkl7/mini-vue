import { reactive } from '../reactive'

describe('reactive', () => {
  it('happy path', () => {
    let info = {
      name: 'why',
      age: 18
    }
    const observed = reactive(info)

    expect(observed).not.toBe(info)
    expect(observed.name).toBe('why')

  })
})