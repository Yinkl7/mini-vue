import { h } from "../../dist/guide-mini-vue.esm.js"
import { Foo } from './Foo.js'

window.self = null
export const App = {
  render() {
    window.self = this
    return h(
      'div', 
      { 
        id: 'root',
        class: ['red', 'hard'],
        // onClick() {
        //   console.log('click', this.message)
        // },
        // onMousedown() {
        //   console.log('mousedown')
        // }
      },
      [
        h('div', {}, 'hi, ' + this.message),
        h(Foo, { 
          count: 1,
          onAdd(a, b) {
            console.log('onAdd============= ', a, b)
          },
          onAddFoo() {
            console.log('onAddFoo============= ')
          }
        })
      ]
      
      // 'hi, mini-vue'
      // [
      //   h('p', { class: 'orange' }, 'hi'),
      //   h('p', { class: 'blue' }, 'mini-vue')
      // ]
    )
  },

  setup() {
    return {
      message: 'mini-vue'
    }
  }
}