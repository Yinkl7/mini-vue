import { h, ref } from "../../lib/guide-mini-vue.esm.js"
import { Child } from "./Child.js"

export const App = {
  render() {
    return h(
      'div', 
      {},
      [
        h('button', { onClick: this.changeCount }, 'change count'),
        h(Child, { count: this.count }),
        h('button', { onClick: this.changeMsg }, 'change msg'),
        h('p', {} , `message: ${this.msg}`)
      ]
    )
  },

  setup() {
    const count = ref(0)
    const changeCount = () => {
      count.value++
    }

    const msg = ref('hello mini-vue')

    const changeMsg = () => {
      msg.value = 'hello world'
    }
    return {
      count,
      changeCount,
      msg,
      changeMsg
    }
  }
}