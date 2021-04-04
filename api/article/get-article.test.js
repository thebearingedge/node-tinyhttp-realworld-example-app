import jwt from 'jsonwebtoken'
import { expect, suite } from '../suite.test.js'

suite('get article: GET /api/articles/:slug', test => {
  let firstUser
  let secondUser
  let token

  test.before.each(async ({ prisma }) => {
    ;[firstUser, secondUser] = await Promise.all([
      prisma.user.create({
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
      }),
      prisma.user.create({
        data: {
          email: 'bar@bar.bar',
          username: 'bar',
          password: 'bar'
        }
      })
    ])
    token = jwt.sign({ userId: secondUser.userId }, process.env.TOKEN_SECRET)
  })

  test('needs a matching slug', async ({ fetch }) => {
    await fetch('/api/articles/how-to-fetch').expect(404, {
      error: 'cannot find article with slug "how-to-fetch"'
    })
  })

  test('knows if the author is not followed', async ({ fetch }) => {
    const req = {
      headers: {
        Authorization: `Token ${token}`
      }
    }
    const res = await fetch(
      '/api/articles/how-to-train-your-dragon',
      req
    ).expect(200)
    const body = await res.json()
    expect(body).to.have.structure({
      article: {
        slug: 'how-to-train-your-dragon',
        title: 'How to train your dragon',
        description: 'Ever wonder how?',
        body: 'You have to believe',
        tagList: [String, String],
        createdAt: String,
        updatedAt: String,
        favorited: false,
        favoritesCount: 0,
        author: {
          username: 'foo',
          bio: null,
          image: null,
          followed: false
        }
      }
    })
  })

  test('knows if the author is followed', async ({ prisma, fetch }) => {
    await prisma.user.update({
      where: { userId: secondUser.userId },
      data: {
        following: {
          connect: { userId: firstUser.userId }
        }
      }
    })
    const req = {
      headers: {
        Authorization: `Token ${token}`
      }
    }
    const res = await fetch(
      '/api/articles/how-to-train-your-dragon',
      req
    ).expect(200)
    const body = await res.json()
    expect(body).to.have.structure({
      article: {
        slug: 'how-to-train-your-dragon',
        title: 'How to train your dragon',
        description: 'Ever wonder how?',
        body: 'You have to believe',
        tagList: [String, String],
        createdAt: String,
        updatedAt: String,
        favorited: false,
        favoritesCount: 0,
        author: {
          username: 'foo',
          bio: null,
          image: null,
          followed: true
        }
      }
    })
  })

  test('knows if the article is favorited', async ({ prisma, fetch }) => {
    await prisma.article.update({
      where: { slug: 'how-to-train-your-dragon' },
      data: {
        favoritesCount: 1,
        favoritedBy: {
          connect: [
            {
              userId: secondUser.userId
            }
          ]
        }
      }
    })
    const req = {
      headers: {
        Authorization: `Token ${token}`
      }
    }
    const res = await fetch(
      '/api/articles/how-to-train-your-dragon',
      req
    ).expect(200)
    const body = await res.json()
    expect(body).to.have.structure({
      article: {
        slug: 'how-to-train-your-dragon',
        title: 'How to train your dragon',
        description: 'Ever wonder how?',
        body: 'You have to believe',
        tagList: [String, String],
        createdAt: String,
        updatedAt: String,
        favorited: true,
        favoritesCount: 1,
        author: {
          username: 'foo',
          bio: null,
          image: null,
          followed: false
        }
      }
    })
  })
})
