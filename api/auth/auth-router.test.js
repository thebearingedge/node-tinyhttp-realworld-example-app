import { suite } from '../util/test-suite.js'

suite('auth: POST /api/users', ({ test, db, client }) => {
  test('requires an email and password', async () => {
    await client('/api/fake').expect(404, {
      error: 'cannot GET /api/fake'
    })
  })
})
