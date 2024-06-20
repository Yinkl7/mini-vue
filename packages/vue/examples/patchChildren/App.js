import { h } from "../../lib/guide-mini-vue.esm.js"

import { ArrayToArray } from "./arrayToArray.js"

import { ArrayToText } from "./ArrayToText.js"

import { TextToArray } from "./TextToArray.js"

import { TextToText } from "./TextToText.js"

export const App = {
  render() {
    return h(
      'div', 
      {},
      [
        h('div', {}, 'App'),
        // h(ArrayToText),
        h(ArrayToArray),
        // h(TextToArray),
        // h(TextToText),
      ]
    )
  },

  setup() {
    return {}
  }
}