export const App = {
  render() {
    return h('div', 'hi, ' + this.message)
  },

  setup() {
    return {
      message: 'mini-vue'
    }
  }
}