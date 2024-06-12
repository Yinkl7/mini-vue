import { h, ref } from "../../lib/guide-mini-vue.esm.js"

// 左侧对比
// abc => abde
// const prevChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'C'}, 'C'),
// ]

// const nextChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'D'}, 'D'),
//   h('p', {key: 'E'}, 'E')
// ]

// 右侧对比
// abc => debc
// const prevChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'C'}, 'C'),
// ]

// const nextChildren = [
//   h('p', {key: 'D'}, 'D'),
//   h('p', {key: 'E'}, 'E'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'C'}, 'C'),
// ]

// 新数组元素大于老数组的元素 创建元素
// ab => abc
const prevChildren = [
  h('p', {key: 'A'}, 'A'),
  h('p', {key: 'B'}, 'B')
]

const nextChildren = [
  h('p', {key: 'A'}, 'A'),
  h('p', {key: 'B'}, 'B'),
  h('p', {key: 'C'}, 'C'),
  h('p', {key: 'D'}, 'D'),
]

ab => cab
// const prevChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B')
// ]

// const nextChildren = [
//   h('p', {key: 'D'}, 'D'),
//   h('p', {key: 'C'}, 'C'),
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
// ]

// 新数组元素小于老数组的元素 删除元素
// 删除右侧
// const prevChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'C'}, 'C'),
// ]

// const nextChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
// ]

// 删除左侧
// const prevChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'C'}, 'C'),
// ]

// const nextChildren = [
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'C'}, 'C'),
// ]

export const ArrayToArray = {
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