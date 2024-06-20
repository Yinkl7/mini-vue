import { h } from "../../dist/guide-mini-vue.esm.js"

export const Foo = {
  /**
   * props
   * 1、setup函数的第一个参数是props
   * 2、render可以通过this访问
   * 3、props是readonly
   */
  setup(props, { emit }) {
    // props.count
    console.log('Foo props========= ', props)
    props.count ++

    const emitAdd = () => {
      console.log('emit add')
      emit('add', 1, 2)
      emit('add-foo')
    }

    return { 
      emitAdd 
    }
  },
  render() {
    const btn = h(
      'button',
      {
        onClick: this.emitAdd
      },
      'emitAdd'
    )
    const foo = h('p', {}, `Foo: ${this.count}`)
    return h('div', {}, [btn, foo])
  }
}