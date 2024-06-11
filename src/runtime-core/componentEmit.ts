import { camelize, toHandlerKey } from "../shared"

export function emit(instance, event, ...args) {
  console.log('emit add')

  const { props } = instance

  // add => Add
  // add-foo => AddFoo

  const handlerName = toHandlerKey(camelize(event))
  const handler = props[handlerName]
  handler && handler(...args)
}