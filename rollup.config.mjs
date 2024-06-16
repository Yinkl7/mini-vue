import typescript from "@rollup/plugin-typescript"
import json from '@rollup/plugin-json'

export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'cjs',
      file: 'lib/guide-mini-vue.cjs.js'
    },
    {
      format: 'es',
      file: 'lib/guide-mini-vue.esm.js'
    }
  ],
  plugins: [
    json(),
    typescript()
  ]
}