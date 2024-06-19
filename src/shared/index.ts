export * from './toDisplayString'

export const extend = Object.assign

export const EMPTY_OBJ = {}

export const isObject = (val) => {
  return val !== null && typeof val === 'object'
}

export const isString = (val) => {
  return typeof val === 'string'
}

export const hasChanged = (val, newVal) => {
  return !Object.is(val, newVal)
}

export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key)

// 烤串变驼峰
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : ''
  })
}

// 首字母大写
export const capitalize = (str: string) => { 
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// 事件字符添加on
export const toHandlerKey = (str: string) => {
  return str ? `on${capitalize(str)}` : ''
}
