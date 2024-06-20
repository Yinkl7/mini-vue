import { h, ref } from "../../lib/guide-mini-vue.esm.js"

window.self = null
export const App = {
  render() {
    window.self = this
    return h(
      'div', 
      {
        ...this.elementProps
      },
      [
        h('div', {}, 'count, ' + this.count),
        h('button', { onClick: this.onClick }, '+1'),
        h('button', { onClick: this.changeElelmentProps }, 'changeElelmentProps'),
        h('button', { onClick: this.changeNullProps }, 'changeNullProps'),
        h('button', { onClick: this.deleteBarProps }, 'deleteBarProps')
      ]
    )
  },

  setup() {
    const count = ref(0)
    const onClick = () => count.value++

    const elementProps = ref({
      foo: 'foo',
      bar: 'bar'
    })

    const changeElelmentProps = () => {
      elementProps.value.foo = 'new-foo'
    }

    const changeNullProps = () => {
      elementProps.value.foo = undefined
    }

    const deleteBarProps = () => {
      elementProps.value = {
        foo: 'foo'
      }
    }
    return {
      count,
      onClick,
      elementProps,
      changeElelmentProps,
      changeNullProps,
      deleteBarProps
    }
  }
}