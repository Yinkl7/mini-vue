import { h, ref } from "../../lib/guide-mini-vue.esm.js"

const nextChildren = 'nextChildren'
const prevChildren = [
  h('div', {}, 'aaa'),
  h('div', {}, 'bbb')
]

export const ArrayToText = {
  render() {
    return this.isChange ? h('div', {}, nextChildren) : h('div', {}, prevChildren)
  },

  setup() {
    const isChange = ref(false)
    window.isChange = isChange

    return {
      isChange,
    }
  }
}