import { h } from "../../lib/guide-mini-vue.esm.js"

export const Child = {
  render() {
    return h('div', {}, `child: ${this.$props.count}`)
  },

  setup(props) {
    const count = props.count
    return {
      count,
    }
  }
}