import { suite as uvuSuite } from 'uvu'

export const suite = (name, context, register) => {
  if (typeof register === 'undefined') {
    register = context
    context = undefined
  }
  const test = uvuSuite(name, context)
  register(test)
  test.run()
}
