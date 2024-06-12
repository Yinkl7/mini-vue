import { h, ref } from "../../lib/guide-mini-vue.esm.js"

const prevChildren = [
  h('p', {key: 'A'}, 'A'),
  h('p', {key: 'B'}, 'B'),
  h('p', {key: 'C'}, 'C'),
]

const nextChildren = [
  h('p', {key: 'A'}, 'A'),
  h('p', {key: 'B'}, 'B'),
  h('p', {key: 'D'}, 'D'),
  h('p', {key: 'E'}, 'E')
]

export const ArrayToArray = {
  render() {
    return h(
      'div', 
      {},
      [
        h('div', {}, 'ArrayToArray'),
      ]
    )
  },

  setup() {
    return {}
  }
}