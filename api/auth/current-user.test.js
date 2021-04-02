import { hash } from 'argon2'
import jwt from 'jsonwebtoken'
import { suite } from '../util/test-suite.js'

suite('current user: GET /api/user', test => {
  test('requires an access token', async ({ fetch }) => {
    await fetch('/api/user').expect(401, {
      error: 'authentication required'
    })
  })

  test('requires a valid token', async ({ fetch }) => {
    const req = {
      headers: {
        Authorization: 'fake token'
      }
    }
    await fetch('/api/user', req).expect(401, {
      error: 'authentication required'
    })
  })

  test('returns the user', async ({ prisma, fetch }) => {
    const { userId } = await prisma.user.create({
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
    const token = jwt.sign({ userId }, process.env.TOKEN_SECRET)
    const req = {
      headers: {
        Authorization: `Token ${token}`
      }
    }
    await fetch('/api/user', req).expect(200, {
      user: {
        email: 'test@test.test',
        username: 'test',
        bio: null,
        image: null,
        token
      }
    })
  })
})