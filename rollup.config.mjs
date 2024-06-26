import typescript from "@rollup/plugin-typescript"
import json from '@rollup/plugin-json'

export default {
  // input: 'src/index.ts',
  input: './packages/vue/src/index.ts',
  output: [
    {
      format: 'cjs',
      // file: 'lib/guide-mini-vue.cjs.js'
      file: 'packages/vue/dist/guide-mini-vue.cjs.js'
    },
    {
      format: 'es',
      // file: 'lib/guide-mini-vue.esm.js'
      file: 'packages/vue/dist/guide-mini-vue.esm.js'
    }
  ],
  plugins: [
    json(),
    typescript()
  ]
}