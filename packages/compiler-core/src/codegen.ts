import { isString } from "@guide-mini-vue/shared";
import { NodeTypes } from "./ast";
import { CREATE_ELEMENT_VNODE, TO_DISPLAY_STRING, helperMapName } from "./runTimeHelpers";

export function generate(ast) {
  const context = createCodengenContext()
  const { push } = context

  getFunctionPreamble(ast, context)

  const functionName = 'render'
  const args = ['_ctx', '_cache']
  const signature = args.join(', ')

  push(`function ${functionName}(${signature}) {`)

  push('return ')
  genNode(ast.codegenNode, context)

  push('}')

  return {
    code: context.code
  }
}

function getFunctionPreamble(ast, context) {
  const { push } = context
  const VueBinging = 'Vue'
  const aliasHelper = (s) => `${helperMapName[s]}:_${helperMapName[s]}`
  if(ast.helpers.length > 0) {
    push(`const { ${ast.helpers.map(aliasHelper).join(', ')} } = ${VueBinging}`)
  }
  push('\n')
  push('return ')
}

function createCodengenContext() {
  const context = {
    code: '',
    push(source) {
      context.code += source
    },
    helper(key) {
      return `_${helperMapName[key]}`
    }
  }
  return context
}

function genNode(node: any, context) {
  switch(node.type) {
    case NodeTypes.TEXT: 
      genText(node, context)
      break
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context)
      break
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context)
      break
    case NodeTypes.ELEMENT:
      genElement(node, context)
      break
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context)
      break
    default:
      break
  }
}

function genText(node, context) {
  const { push } = context
  push(`'${node.content}'`)
}

function genInterpolation(node, context) {
  const { push, helper } = context
  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(')')
}

function genExpression(node: any, context: any) {
  const { push } = context
  push(`${node.content}`)
}

function genElement(node, context) {
  const { push, helper } = context
  const { tag, children, props } = node
  console.log('children: ', children)
  // push(`${helper(CREATE_ELEMENT_VNODE)}('${tag}'), null, 'hi', + _toDisplayString(_ctx.message)`)
  push(`${helper(CREATE_ELEMENT_VNODE)}(`)

  // for(let i = 0; i < children.length; i++) {
  //   const child = children[i]
  //   genNode(child, context)
  // }
  // const child = children[0]
  genNodeList(genNullable([tag, props, children]), context)
  // genNode(children, context)
  push(')')
}

function genNodeList(nodes, context) {
  const { push } = context
  for(let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if(isString(node)) {
      push(node)
    } else {
      genNode(node, context)
    }

    if(i < nodes.length - 1) {
      push(', ')
    }
  }
}

function genNullable(args) {
  return args.map((arg) => arg || 'null')
}

function genCompoundExpression(node, context) {
  const { push } = context
  const children = node.children
  for(let i = 0; i < children.length; i++) {
    const child = children[i]
    if(isString(child)) {
      push(child)
    } else {
      genNode(child, context)
    }
  }
}
