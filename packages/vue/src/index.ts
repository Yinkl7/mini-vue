export * from '@guide-mini-vue/runtime-dom'
import { baseCompile } from '@guide-mini-vue/compiler-core'
import * as runtimeDom from '@guide-mini-vue/runtime-dom'
import { registerRuntimeCompiler } from '@guide-mini-vue/runtime-dom'


export function compileToFunction(template) {
  const { code } = baseCompile(template)
  const render = new Function('Vue', code)(runtimeDom)
  return render
} 

// 避免 compiler-core 和 runtime-core 耦合
registerRuntimeCompiler(compileToFunction)
