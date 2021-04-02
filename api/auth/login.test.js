import { hash } from 'argon2'
import * as assert from 'uvu/assert'
import { suite } from '../util/test-suite.js'

suite('login: POST /api/users/login', test => {
  test('requires a user', async ({ fetch }) => {
    const req = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    }
    await fetch('/api/users/login', req).expect(422, {
      errors: {
        body: ["must have required property 'user'"]
      }
    })
  })

  test('requires an email, and password', async ({ fetch }) => {
    const req = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: {}
      })
    }
    await fetch('/api/users/login', req).expect(422, {
      errors: {
        body: [
          "must have required property 'email'",
          "must have required property 'password'"
        ]
      }
    })
  })

  test('requires an existing email', async ({ fetch }) => {
    const req = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: {
          email: 'test@test.test',
          password: 'test'
        }
      })
    }
    await fetch('/api/users/login', req).expect(401, {
      error: 'invalid login'
    })
  })

  test('requires matching credentials', async ({ prisma, fetch }) => {
    await prisma.user.create({
      data: {
        email: 'test@test.test',
        password: await hash('test'),
        profile: {
          create: {
            username: 'test'
          }
        }
      }
    })
    const req = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: {
          email: 'test@test.test',
          password: 'letmein'
        }
      })
    }
    await fetch('/api/users/login', req).expect(401, {
      error: 'invalid login'
    })
  })

  test('returns an authenticated user', async ({ prisma, fetch }) => {
    await prisma.user.create({
      data: {
        email: 'test@test.test',
        password: await hash('test'),
        profile: {
          create: {
            username: 'test'
          }
        }
      }
    })
    const req = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: {
          email: 'test@test.test',
          password: 'test'
        }
      })
    }
    const res = await fetch('/api/users/login', req).expect(201)
    const { user } = await res.json()
    assert.is(user.email, 'test@test.test')
    assert.is(user.username, 'test')
    assert.is(user.bio, null)
    assert.is(user.image, null)
    assert.type(user.token, 'string')
  })
})
