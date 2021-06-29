import jwt from 'jsonwebtoken'
import { suite } from '../suite.test.js'

suite('delete article: DELETE /api/articles/:slug', test => {
  test('requires authentication', async ({ fetch }) => {
    const req = {
      method: 'delete'
    }
    await fetch('/api/articles/test-article', req).expect(401, {
      error: 'authentication required'
    })
  })
  test('successfully delete an article', async ({ prisma, fetch }) => {
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
    await fetch('/api/articles/how-to-train-your-dragon', req).expect(200)
  })
})
