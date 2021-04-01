import { suite } from '../util/test-suite.js'

suite('auth: POST /api/users', test => {
  test('requires a user', async ({ client }) => {
    const req = {
      method: 'post',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({})
    }
    await client('/api/users', req).expect(422, {
      errors: {
        body: ["must have required property 'user'"]
      }
    })
  })
})
