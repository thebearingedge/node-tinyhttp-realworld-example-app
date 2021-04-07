import jwt from 'jsonwebtoken'
import { expect, suite } from '../suite.test.js'

suite('create article: PUT /api/articles/:slug', test => {
  test('requires authentication', async ({ fetch }) => {
    const req = {
      method: 'put'
    }
    await fetch('/api/articles/test-article', req).expect(401, {
      error: 'authentication required'
    })
  })

  test('requires a an article', async ({ fetch }) => {
    const token = jwt.sign({ userId: 1 }, process.env.TOKEN_SECRET)
    const req = {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`
      },
      body: JSON.stringify({})
    }
    await fetch('/api/articles/test-article', req).expect(422, {
      errors: {
        body: ["must have required property 'article'"]
      }
    })
  })

  test('requires an existing article', async ({ fetch }) => {
    const token = jwt.sign({ userId: 1 }, process.env.TOKEN_SECRET)
    const req = {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`
      },
      body: JSON.stringify({
        article: {
          title: 'How to train your dragon 2',
          description: 'So toothless',
          body: 'It a dragon'
        }
      })
    }
    await fetch('/api/articles/test-article', req).expect(404, {
      error: 'cannot update article "test-article"'
    })
  })

  test('returns the updated article', async ({ prisma, fetch }) => {
    const { userId } = await prisma.user.create({
      data: {
        email: 'foo@foo.foo',
        username: 'foo',
        password: 'foo',
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
    const token = jwt.sign({ userId }, process.env.TOKEN_SECRET)
    const req = {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`
      },
      body: JSON.stringify({
        article: {
          title: 'How to train your dragon 2',
          description: 'So toothless',
          body: 'It a dragon'
        }
      })
    }
    const res = await fetch(
      '/api/articles/how-to-train-your-dragon',
      req
    ).expect(200)
    const body = await res.json()
    expect(body).to.have.structure({
      article: {
        title: 'How to train your dragon 2',
        slug: 'how-to-train-your-dragon-2',
        description: 'So toothless',
        body: 'It a dragon',
        tagList: [String, String],
        createdAt: String,
        updatedAt: String,
        favorited: false,
        favoritesCount: 0,
        author: {
          username: 'foo',
          image: null,
          bio: null,
          following: false
        }
      }
    })
  })
})
