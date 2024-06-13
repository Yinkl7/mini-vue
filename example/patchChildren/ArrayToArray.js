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

// 1、新数组元素大于老数组的元素 创建元素
// ab => abc
// const prevChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B')
// ]

// const nextChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'C'}, 'C'),
//   h('p', {key: 'D'}, 'D'),
// ]

// ab => cab
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

// 2、新数组元素小于老数组的元素 删除元素
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

// 3、中间对比
// ab (cd) fg => ab (ec) fg

// const prevChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'C', id: 'c-prev'}, 'C'),
//   h('p', {key: 'D'}, 'D'),
//   h('p', {key: 'F'}, 'F'),
//   h('p', {key: 'G'}, 'G'),
// ]

// const nextChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'E'}, 'E'),
//   h('p', {key: 'C', id: 'c-next'}, 'C'),
//   h('p', {key: 'F'}, 'F'),
//   h('p', {key: 'G'}, 'G'),
// ]

// const prevChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'C', id: 'c-prev'}, 'C'),
//   h('p', {key: 'E'}, 'E'),
//   h('p', {key: 'D'}, 'D'),
//   h('p', {key: 'F'}, 'F'),
//   h('p', {key: 'G'}, 'G'),
// ]

// const nextChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'E'}, 'E'),
//   h('p', {key: 'C', id: 'c-next'}, 'C'),
//   h('p', {key: 'F'}, 'F'),
//   h('p', {key: 'G'}, 'G'),
// ]

// 移动元素
// const prevChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'C', id: 'c-prev'}, 'C'),
//   h('p', {key: 'D'}, 'D'),
//   h('p', {key: 'E'}, 'E'),
//   h('p', {key: 'F'}, 'F'),
//   h('p', {key: 'G'}, 'G'),
// ]

// const nextChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'E'}, 'E'),
//   h('p', {key: 'C', id: 'c-prev'}, 'C'),
//   h('p', {key: 'D'}, 'D'),
//   h('p', {key: 'F'}, 'F'),
//   h('p', {key: 'G'}, 'G'),
// ]

// 移动并创建新、删除节点
// const prevChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'C', id: 'c-prev'}, 'C'),
//   h('p', {key: 'D'}, 'D'),
//   h('p', {key: 'Y'}, 'Y'),
//   h('p', {key: 'E'}, 'E'),
//   h('p', {key: 'F'}, 'F'),
//   h('p', {key: 'G'}, 'G'),
// ]

// const nextChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'E'}, 'E'),
//   h('p', {key: 'C', id: 'c-next'}, 'C'),
//   h('p', {key: 'D'}, 'D'),
//   h('p', {key: 'H'}, 'H'),
//   h('p', {key: 'F'}, 'F'),
//   h('p', {key: 'G'}, 'G'),
// ]

const prevChildren = [
  h('p', {key: 'A'}, 'A'),
  h('p', {key: 'B'}, 'B'),
  h('p', {key: 'C', id: 'c-prev'}, 'C'),
  h('p', {key: 'D'}, 'D'),
  h('p', {key: 'E'}, 'E'),
  h('p', {key: 'Z'}, 'Z'),
  h('p', {key: 'F'}, 'F'),
  h('p', {key: 'G'}, 'G'),
]

const nextChildren = [
  h('p', {key: 'A'}, 'A'),
  h('p', {key: 'B'}, 'B'),
  h('p', {key: 'D'}, 'D'),
  h('p', {key: 'C', id: 'c-next'}, 'C'),
  h('p', {key: 'y'}, 'Y'),
  h('p', {key: 'E'}, 'E'),
  h('p', {key: 'F'}, 'F'),
  h('p', {key: 'G'}, 'G'),
]


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