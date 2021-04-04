import jwt from 'jsonwebtoken'
import { suite } from '../util/suite.test.js'

suite('follow user: POST /api/profiles/:username/follow', test => {
  let firstUser
  let secondUser
  let token

  test.before.each(async ({ prisma }) => {
    ;[firstUser, secondUser] = await Promise.all([
      prisma.user.create({
        data: {
          email: 'foo@foo.foo',
          password: 'foo',
          username: 'foo',
          bio: 'foo',
          image: 'https://foo.foo'
        },
        select: {
          username: true,
          bio: true,
          image: true
        }
      }),
      prisma.user.create({
        data: {
          email: 'bar@bar.bar',
          password: 'bar',
          username: 'bar',
          bio: 'bar',
          image: 'https://bar.bar'
        },
        select: {
          userId: true,
          username: true,
          bio: true,
          image: true
        }
      })
    ])
    token = jwt.sign({ userId: secondUser.userId }, process.env.TOKEN_SECRET)
  })

  test('requires authentication', async ({ fetch }) => {
    const req = {
      method: 'post'
    }
    await fetch('/api/profiles/test/follow', req).expect(401, {
      error: 'authentication required'
    })
  })

  test('requires an existing profile', async ({ fetch }) => {
    const req = {
      method: 'post',
      headers: {
        Authorization: `Token ${token}`
      }
    }
    await fetch('/api/profiles/baz/follow', req).expect(404, {
      error: 'cannot find profile with username "baz"'
    })
  })

  test('returns the followed profile', async ({ fetch }) => {
    const req = {
      method: 'post',
      headers: {
        Authorization: `Token ${token}`
      }
    }
    await fetch('/api/profiles/foo/follow', req).expect(200, {
      profile: {
        ...firstUser,
        following: true
      }
    })
  })
})
