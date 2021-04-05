import jwt from 'jsonwebtoken'
import { expect, suite } from '../suite.test.js'

suite('favorite article: POST', test => {
  let token

  test.before.each(async ({ prisma }) => {
    const { userId } = await prisma.user.create({
      data: {
        email: 'test@test.test',
        username: 'test',
        password: 'test',
        articles: {
          create: {
            slug: 'how-to-train-your-dragon',
            title: 'How to train your dragon',
            description: 'Ever wonder how?',
            body: 'You have to believe',
            tags: {
              create: [{ value: 'dragons' }, { value: 'training' }]
            }
          }
        }
      }
    })
    token = jwt.sign({ userId }, process.env.TOKEN_SECRET)
  })

  test('requires authentication', async ({ fetch }) => {
    const req = {
      method: 'post'
    }
    await fetch('/api/articles/how-to-train-your-dragon/favorite', req).expect(
      401,
      {
        error: 'authentication required'
      }
    )
  })

  test('requires an existing article', async ({ fetch }) => {
    const req = {
      method: 'post',
      headers: {
        Authorization: `Token ${token}`
      }
    }
    await fetch('/api/articles/how-to/favorite', req).expect(404, {
      error: 'cannot find article with slug "how-to"'
    })
  })

  test('returns the favorited article', async ({ fetch }) => {
    const req = {
      method: 'post',
      headers: {
        Authorization: `Token ${token}`
      }
    }
    const res = await fetch(
      '/api/articles/how-to-train-your-dragon/favorite',
      req
    ).expect(200)
    const body = await res.json()
    expect(body).to.have.structure({
      article: {
        slug: 'how-to-train-your-dragon',
        title: 'How to train your dragon',
        description: 'Ever wonder how?',
        body: 'You have to believe',
        createdAt: String,
        updatedAt: String,
        tagList: [String, String],
        favoritesCount: 1,
        favorited: true,
        author: {
          username: 'test',
          bio: null,
          image: null,
          following: false
        }
      }
    })
  })
})
