import { h, createTextVnode, getCurrentInstance } from "../../lib/guide-mini-vue.esm.js"
import { Foo } from './Foo.js'

export const App = {
  render() {
    const app = h('div', {}, 'app')
    /**
     * 1、获取渲染元素
     * 2、获取渲染位置
     */
    // 单个vnode
    // const foo = h(Foo, {}, h('p', {}, '456'))
    // 数组
    // const foo = h(Foo, {}, [h('p', {}, '123'), h('p', {}, '456')])

    const foo = h(Foo, {}, 
      { 
        header: ({ age }) => [h('p', {}, 'header: ' + age), createTextVnode('你好啊！')], 
        footer: () => h('p', {}, 'footer')
      }
    )

    return h('div', {}, [app, foo])
  },

  setup() {
    const instance = getCurrentInstance()
    // console.log('app instance= ', instance)
    return {
      message: 'mini-vue'
    }
  }
}