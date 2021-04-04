import { suite } from '../suite.test.js'

suite('get tags: GET /api/tags', test => {
  test('returns a list of all tags', async ({ prisma, fetch }) => {
    await prisma.tag.createMany({
      data: [{ value: 'foo' }, { value: 'bar' }, { value: 'baz' }]
    })
    await fetch('/api/tags').expect(200, {
      tags: ['foo', 'bar', 'baz']
    })
  })
})
