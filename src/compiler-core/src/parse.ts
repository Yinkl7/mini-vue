import { NodeTypes } from "./ast"

const enum TagType {
  START,
  END,
}

export function baseParse(content: string) {

  const context = createParserContext(content)

  return createRoot(parseChildren(context, []))
}
/**
 * 
 * @param context 
 * @param ancestors 用一个栈来记录并对比element tag是否结束
 * @returns 
 */
function parseChildren(context, ancestors) {
  const nodes: any[] = []
  while(!isEnd(context, ancestors)) {
    let node
    const s = context.source
    if(s.startsWith('{{')) {
      node = parseInterpolation(context)
    } else if(s.startsWith('<')) {
      if(/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors)
      }
    }

    if(!node) {
      node = parseText(context)
    }

    nodes.push(node)
  }
  return nodes
}

function isEnd(context, ancestors) {
  /**
   * 1、source有值
   * 2、当遇到结束标签时
   */
  const s = context.source
  if(s.startsWith('</')) {
    for(let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag
      if(startsWithEndTagOpen(s, tag)) {
        return true
      }
    }
  }
  
  return !s
}

function parseText(context) {
  /**
   * 1、获取内容
   * 2、删除内容
   */
  let endIndex = context.source.length
  let endTokens = ['</', '{{']

  for(let i = 0; i < endTokens.length; i++){
    const index = context.source.indexOf(endTokens[i])
    if(index !== -1 && endIndex > index) {
      endIndex = index
    }
  }
  
  
  const content = parseTextData(context, endIndex)

  return {
    type: NodeTypes.TEXT,
    content
  }
}

function parseTextData(context, length) {
  const content = context.source.slice(0, length)

  advanceBy(context, content.length)

  return content
}

function parseElement(context, ancestors) {
  const element: any = parseTag(context, TagType.START)
  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()

  // console.log('--------------- ', context.source)
  if(startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.END)
  } else {
    throw new Error(`缺少结束标签：${element.tag}`)
  }
  
  return element
}

function startsWithEndTagOpen(source, tag: string) {
  return source.startsWith('</') && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
}

function parseTag(context, type: TagType) {
  /**
   * 1、解析tag
   * 2、删除解析的代码
   */
  const match: any = /^<\/?([a-z]*)/i.exec(context.source)
  const tag = match[1]
  // 删除 <div
  advanceBy(context, match[0].length)
  // 删除右尖括号
  advanceBy(context, 1)

  if(type === TagType.END) return

  return {
    type: NodeTypes.ELEMENT,
    tag,
  }
}

function parseInterpolation(context) {
  // {{message}}
  const openDelimiter = '{{'
  const closeDelimiter = '}}'

  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)

  advanceBy(context, openDelimiter.length)

  const rawContentlength = closeIndex - openDelimiter.length

  const rawContent = parseTextData(context, rawContentlength)
  const content = rawContent.trim()
  // 处理 }}
  advanceBy(context, closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
    }
  }
}

function advanceBy(context, length) {
  context.source = context.source.slice(length)
}

function createRoot(children) {
  return {
    children,
    type: NodeTypes.ROOT,
  }
}

function createParserContext(content: string) {
  return {
    source: content
  }
}
