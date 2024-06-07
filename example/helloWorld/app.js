import { h } from "../../lib/guide-mini-vue.esm.js"

export const App = {
  render() {
    return h(
      'div', 
      { 
        id: 'root',
        class: ['red', 'hard']
      },
      // 'hi, ' + this.message
      // 'hi, mini-vue'
      [
        h('p', { class: 'orange' }, 'hi'),
        h('p', { class: 'blue' }, 'mini-vue')
      ]
    )
  },

  setup() {
    return {
      message: 'mini-vue'
    }
  }
}