import { suite } from '../util/test-suite.js'
import * as assert from 'uvu/assert'

suite('auth: POST /api/user', test => {
  test('requires a user', async ({ client }) => {
    const req = {
      method: 'post',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({})
    }
    await client('/api/user', req).expect(422, {
      errors: {
        body: ["must have required property 'user'"]
      }
    })
  })

  test('requires a username, email, and password', async ({ client }) => {
    const req = {
      method: 'post',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        user: {}
      })
    }
    await client('/api/user', req).expect(422, {
      errors: {
        body: [
          "must have required property 'email'",
          "must have required property 'username'",
          "must have required property 'password'"
        ]
      }
    })
  })

  test('returns a User', async ({ client }) => {
    const req = {
      method: 'post',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        user: {
          email: 'test@test.test',
          username: 'test',
          password: 'test'
        }
      })
    }
    const res = await client('/api/user', req).expect(201)
    const { user } = await res.json()
    assert.is(user.email, 'test@test.test')
    assert.is(user.username, 'test')
    assert.is(user.bio, null)
    assert.is(user.image, null)
    assert.type(user.token, 'string')
  })
})
