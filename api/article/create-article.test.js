import jwt from 'jsonwebtoken'
import { Nullable } from 'type-diff'
import { expect, suite } from '../util/suite.test.js'

suite('create article: POST /api/articles', test => {
  test('requires authentication', async ({ fetch }) => {
    const req = {
      method: 'post'
    }
    await fetch('/api/articles', req).expect(401, {
      error: 'authentication required'
    })
  })

  test('requires a an article', async ({ fetch }) => {
    const token = jwt.sign({ userId: 1 }, process.env.TOKEN_SECRET)
    const req = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`
      },
      body: JSON.stringify({})
    }
    await fetch('/api/articles', req).expect(422, {
      errors: {
        body: ["must have required property 'article'"]
      }
    })
  })

  test('requires a valid article', async ({ fetch }) => {
    const token = jwt.sign({ userId: 1 }, process.env.TOKEN_SECRET)
    const req = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`
      },
      body: JSON.stringify({
        article: {}
      })
    }
    await fetch('/api/articles', req).expect(422, {
      errors: {
        body: [
          "must have required property 'title'",
          "must have required property 'description'",
          "must have required property 'body'"
        ]
      }
    })
  })

  test('returns the created article', async ({ prisma, fetch }) => {
    const { userId } = await prisma.user.create({
      data: {
        email: 'test@test.test',
        password: 'test',
        username: 'test'
      }
    })
    const token = jwt.sign({ userId }, process.env.TOKEN_SECRET)
    const req = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`
      },
      body: JSON.stringify({
        article: {
          title: 'How to train your dragon',
          description: 'Ever wonder how?',
          body: 'You have to believe',
          tagList: ['reactjs', 'angularjs', 'dragons']
        }
      })
    }
    const res = await fetch('/api/articles', req).expect(201)
    const body = await res.json()
    expect(body).to.have.structure({
      article: {
        title: 'How to train your dragon',
        slug: 'how-to-train-your-dragon',
        description: 'Ever wonder how?',
        body: 'You have to believe',
        tagList: [String, String, String],
        createdAt: String,
        updatedAt: String,
        favorited: false,
        favoritesCount: 0,
        author: {
          username: 'test',
          image: Nullable(String),
          bio: Nullable(String),
          following: false
        }
      }
    })
  })
})
