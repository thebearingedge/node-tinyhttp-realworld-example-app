import { hash } from 'argon2'
import jwt from 'jsonwebtoken'
import { suite } from '../util/suite.test.js'

suite('follow user: POST /api/profiles/:username/follow', test => {
  let firstUser
  let secondUser

  test.before.each(async ({ prisma }) => {
    ;[firstUser, secondUser] = await Promise.all([
      prisma.user.create({
        data: {
          email: 'foo@foo.foo',
          password: await hash('foo'),
          profile: {
            create: {
              username: 'foo',
              bio: 'foo',
              image: 'https://foo.foo'
            }
          }
        },
        select: {
          userId: true,
          profile: {
            select: { username: true, bio: true, image: true }
          }
        }
      }),
      prisma.user.create({
        data: {
          email: 'bar@bar.bar',
          password: await hash('bar'),
          profile: {
            create: {
              username: 'bar',
              bio: 'bar',
              image: 'https://bar.bar'
            }
          }
        },
        select: {
          userId: true,
          profile: {
            select: { username: true, bio: true, image: true }
          }
        }
      })
    ])
  })

  test('requires authentication', async ({ fetch }) => {
    const req = {
      method: 'post'
    }
    await fetch('/api/profiles/test/follow', req).expect(401, {
      error: 'authentication required'
    })
  })

  test('returns the followed user', async ({ fetch }) => {
    const token = jwt.sign(
      { userId: secondUser.userId },
      process.env.TOKEN_SECRET
    )
    const req = {
      method: 'post',
      headers: {
        Authorization: `Token ${token}`
      }
    }
    await fetch('/api/profiles/foo/follow', req).expect(201, {
      profile: {
        ...firstUser.profile,
        following: true
      }
    })
  })
})
