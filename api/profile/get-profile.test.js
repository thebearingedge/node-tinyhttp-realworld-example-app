import { hash } from 'argon2'
import jwt from 'jsonwebtoken'
import { suite } from '../util/test-suite.js'

suite('get profile: GET /api/profiles/:username', test => {
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
        }
      })
    ])
  })

  test('accounts for missing profiles', async ({ fetch }) => {
    await fetch('/api/profiles/test').expect(404, {
      error: "cannot find profile with username 'test'"
    })
  })

  test('returns the matching profile', async ({ fetch }) => {
    await fetch('/api/profiles/foo').expect(200, {
      profile: {
        username: 'foo',
        bio: 'foo',
        image: 'https://foo.foo',
        following: false
      }
    })
  })

  test('it returns whether the profile is followed', async ({
    fetch,
    prisma
  }) => {
    await prisma.follow.create({
      data: {
        userId: secondUser.userId,
        profileId: firstUser.userId
      }
    })
    const token = jwt.sign(
      { userId: secondUser.userId },
      process.env.TOKEN_SECRET
    )
    const req = {
      headers: {
        Authorization: `Token ${token}`
      }
    }
    await fetch('/api/profiles/foo', req).expect(200, {
      profile: {
        username: 'foo',
        bio: 'foo',
        image: 'https://foo.foo',
        following: true
      }
    })
  })
})
