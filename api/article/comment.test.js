import jwt from 'jsonwebtoken'
import { expect, suite } from '../suite.test.js'

suite('create comment: POST /api/articles/:slug/comments', test => {
  test('requires auth', async ({ fetch }) => {
    const req = {
      method: 'post'
    }
    await fetch('/api/articles/test-article/comments', req).expect(401, {
      error: 'authentication required'
    })
  })

  test('requires a valid article', async ({ prisma, fetch }) => {
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
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`
      },
      body: JSON.stringify({
        comment: {
          body: 'His name was my name too.'
        }
      })
    }
    await fetch('/api/articles/test-article/comments', req).expect(404, {
      error: 'cannot find article with slug "test-article"'
    })
  })

  test('success & returns comment schema', async ({ prisma, fetch }) => {
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
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`
      },
      body: JSON.stringify({
        comment: {
          body: 'His name was my name too.'
        }
      })
    }
    const res = await fetch(
      '/api/articles/how-to-train-your-dragon/comments',
      req
    ).expect(200)
    const body = await res.json()
    expect(body).to.have.structure({
      comment: {
        id: Number,
        createdAt: String,
        updatedAt: String,
        body: 'His name was my name too.',
        author: {
          username: 'foo',
          bio: null,
          image: null
        }
      }
    })
  })
})

suite('get comment: GET /api/articles/:slug/comments', test => {
  test('requires a valid article - without auth', async ({ fetch }) => {
    const req = {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      }
    }
    await fetch('/api/articles/test-article/comments', req).expect(404, {
      error: 'cannot find article with slug "test-article"'
    })
  })
})

suite('delete comment: DELETE /api/articles/:slug/comments/:id', test => {
  test('requires auth', async ({ fetch }) => {
    const req = {
      method: 'delete'
    }
    await fetch('/api/articles/test-article/comments/1', req).expect(401, {
      error: 'authentication required'
    })
  })

  test('requires a valid article', async ({ prisma, fetch }) => {
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
      method: 'delete',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`
      }
    }
    await fetch('/api/articles/test-article/comments/1', req).expect(404, {
      error: 'cannot find article with slug "test-article"'
    })
  })
})
