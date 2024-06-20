import { h, ref, getCurrentInstance, nextTick } from "../../lib/guide-mini-vue.esm.js"

export const App = {
  render() {
    return h(
      'div', 
      {},
      [
        h('div', {}, `count: ${this.count}`),
        h('button', { onClick: this.changeCount }, 'change count'),
      ]
    )
  },

  setup() {
    const instance = getCurrentInstance()
    const count = ref(0)
    const changeCount = () => {
      for(let i = 0; i < 100; i++) {
        count.value = i
      }
      debugger
      console.log('instance1: ', instance)
      nextTick(() => {
        console.log('instance2: ', instance)
      })
    }

    return {
      count,
      changeCount,
    }
  }
}