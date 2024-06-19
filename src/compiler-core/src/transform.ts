import { NodeTypes } from "./ast"
import { TO_DISPLAY_STRING } from "./runTimeHelpers"

export function transform(root, options = {}) {
  const context = createTransformContext(root, options)
  // 1、遍历-深度优先搜索
  // 2、修改 text content
  traverseNode(root, context)
  createCodegenNode(root)

  root.helpers = [...context.helpers.keys()]
}

function createCodegenNode(root) {
  let child = root.children[0]
  if(child.type === NodeTypes.ELEMENT) {
    root.codegenNode = child.codegenNode
  } else {
    root.codegenNode = root.children[0]
  }
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1)
    }
  }

  return context
}

function traverseNode(node: any, context: any) {
  // console.log("node: ", node)

  const { nodeTransforms } = context 

  const exitFns: any[] = []
  for(let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i]
    const onExit = transform(node, context)
    if(onExit) exitFns.push(onExit)
  }

  switch(node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
      break
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      traverseChildren(node, context)
      break
    default:
      break
  }

  let i = exitFns.length
  while(i--) {
    exitFns[i]()
  }
}

function traverseChildren(node: any, context) {
  const children = node.children

  // if(children) {
  for(let i = 0; i < children.length; i++) {
    const node = children[i]
    traverseNode(node, context)
  }
  // }
}
