import { h, ref } from "../../lib/guide-mini-vue.esm.js"

window.self = null
export const App = {
  render() {
    window.self = this
    return h(
      'div', 
      {},
      [
        h('div', {}, 'count, ' + this.count),
        h('button', { onClick: this.onClick }, '+1')
      ]
    )
  },

  setup() {
    const count = ref(0)
    const onClick = () => count.value++
    return {
      count,
      onClick
    }
  }
}