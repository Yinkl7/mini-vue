import { h, renderSlots, getCurrentInstance } from "../../lib/guide-mini-vue.esm.js"

export const Foo = {
  setup() {
    const instance = getCurrentInstance()
    // console.log('foo instance= ', instance)
  },
  render() {
    const foo = h('p', {}, 'foo')
    console.log(this.$slots)

    const age = 18
    return h('p', {}, [
      renderSlots(this.$slots, 'header', { age }), 
      foo, 
      renderSlots(this.$slots, 'footer')
    ])
  }
}