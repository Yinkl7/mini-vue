export function transform(root, options) {
  const context = createTransformContext(root, options)
  // 1、遍历-深度优先搜索
  traverseNode(root, context)

  // 2、修改 text content
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || []
  }

  return context
}

function traverseNode(node: any, context) {
  console.log(node)

  const { nodeTransforms } = context 
  for(let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i]
    transform(node)
  }

  traverseChildren(node, context)
}

function traverseChildren(node: any, context) {
  const children = node.children

  if(children) {
    for(let i = 0; i < children.length; i++) {
      const node = children[i]

      traverseNode(node, context)
    }
  }
}
