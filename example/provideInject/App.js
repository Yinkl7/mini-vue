import { h, provide, inject } from "../../lib/guide-mini-vue.esm.js"

export const App = {
  setup() {
    provide('name', 'aaa')
    provide('age', 18)
  },
  render() {
    return h(
      'div', 
      {},
      [
        h('div', {}, 'Provide'),
        h(Provide)
      ]
    )
  }
}

export const Provide = {
  setup() {
    provide('name', 'bbb')
    const name = inject('name')

    return {
      name
    }
  },
  render() {
    return h(
      'div', 
      {},
      [
        h('div', {}, `Provide2, ${this.name}`),
        h(Consumer)
      ]
    )
  }
}

export const Consumer = {
  setup() {
    const name = inject('name')
    const age = inject('age')

    return {
      name,
      age
    }
  },
  render() {
    return h('div', {}, `Consumer, ${this.name}, ${this.age}`)
  }
}
