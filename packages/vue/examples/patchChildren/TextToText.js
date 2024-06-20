import { h, ref } from "../../lib/guide-mini-vue.esm.js"

const nextChildren = 'nextChild'
const prevChildren = 'prevChild'

export const TextToText = {
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