import { generate } from "./codegen"
import { baseParse } from "./parse"
import { transform } from "./transform"
import { transformElement } from "./transforms/transformElement"
import { transformText } from "./transforms/transformText"
import { transformExpression } from "./transforms/transfromExpression"

export function baseCompile(template) {
  const ast: any = baseParse(template)
  transform(ast, {
    nodeTransforms: [transformExpression, transformElement, transformText],
  })

  return generate(ast)
}