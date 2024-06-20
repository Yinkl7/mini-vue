import { ref } from "../../dist/guide-mini-vue.esm.js"

export const App = {
  name: 'App',
  template: '<div>h1,{{count}}</div>',
  setup() {
    const count = ref(0)
    window.count = count
    return {
      count
    }
  }
}