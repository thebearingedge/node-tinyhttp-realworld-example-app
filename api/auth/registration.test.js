import { suite, expect } from '../util/suite.test.js'

suite('registration: POST /api/users', test => {
  test('requires a user', async ({ fetch }) => {
    const req = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    }
    await fetch('/api/users', req).expect(422, {
      errors: {
        body: ["must have required property 'user'"]
      }
    })
  })

  test('requires a username, email, and password', async ({ fetch }) => {
    const req = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: {}
      })
    }
    await fetch('/api/users', req).expect(422, {
      errors: {
        body: [
          "must have required property 'username'",
          "must have required property 'email'",
          "must have required property 'password'"
        ]
      }
    })
  })

  test('returns the user', async ({ fetch }) => {
    const req = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: {
          email: 'test@test.test',
          username: 'test',
          password: 'test'
        }
      })
    }
    const res = await fetch('/api/users', req).expect(201)
    const { user } = await res.json()
    expect(user).to.have.structure({
      email: 'test@test.test',
      username: 'test',
      bio: null,
      image: null,
      token: String
    })
  })
})
