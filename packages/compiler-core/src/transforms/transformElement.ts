import { NodeTypes, createVNodeCall } from "../ast";

export function transformElement(node, context) {
  if(node.type === NodeTypes.ELEMENT) {
    return () => {
      // 中间处理层
      const { children, tag } = node
      // tag
      const vnodeTag = `'${tag}'`

      // props
      let vnodeProps

      let vnodeChildren = children[0]

      node.codegenNode = createVNodeCall(context, vnodeTag, vnodeProps, vnodeChildren)
    }
  }
}