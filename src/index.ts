export * from './runtime-dom'

// export * from './reactivity'

import { baseCompile } from './compiler-core/src'
import * as runtimeDom from './runtime-dom'
import { registerRuntimeCompiler } from './runtime-dom'


export function compileToFunction(template) {
  const { code } = baseCompile(template)
  const render = new Function('Vue', code)(runtimeDom)
  return render
} 

// 避免 compiler-core 和 runtime-core 耦合
registerRuntimeCompiler(compileToFunction)
