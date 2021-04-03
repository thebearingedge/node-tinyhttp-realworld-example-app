import { hash } from 'argon2'
import jwt from 'jsonwebtoken'
import { suite } from '../util/test-suite.js'

suite('update user: PUT /api/user', test => {
  test('requires an access token', async ({ fetch }) => {
    await fetch('/api/user').expect(401, {
      error: 'authentication required'
    })
  })

  test('requires a user', async ({ prisma, fetch }) => {
    const { userId } = await prisma.user.create({
      data: {
        email: 'foo@foo.foo',
        password: await hash('foo'),
        profile: {
          create: {
            username: 'foo'
          }
        }
      }
    })
    const token = jwt.sign({ userId }, process.env.TOKEN_SECRET)
    const req = {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`
      },
      body: JSON.stringify({})
    }
    await fetch('/api/user', req).expect(422, {
      errors: {
        body: ["must have required property 'user'"]
      }
    })
  })

  test('returns the updated user', async ({ prisma, fetch }) => {
    const { userId } = await prisma.user.create({
      data: {
        email: 'foo@foo.foo',
        password: await hash('foo'),
        profile: {
          create: {
            username: 'foo'
          }
        }
      }
    })
    const token = jwt.sign({ userId }, process.env.TOKEN_SECRET)
    const req = {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`
      },
      body: JSON.stringify({
        user: {
          username: 'bar',
          email: 'bar@bar.bar',
          bio: 'bar',
          image: 'https://bar.bar'
        }
      })
    }
    await fetch('/api/user', req).expect(200, {
      user: {
        token,
        username: 'bar',
        email: 'bar@bar.bar',
        bio: 'bar',
        image: 'https://bar.bar'
      }
    })
  })
})
