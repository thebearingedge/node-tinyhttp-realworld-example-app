import prisma from '@prisma/client'
import { makeFetch } from 'supertest-fetch'
import { createApi } from '../create-api.js'
import { suite } from '../util/test-suite.js'

const app = createApi()
const server = app.listen()
const client = makeFetch(server)
const db = new prisma.PrismaClient()

suite('auth router', test => {
  test.after(async () => {
    await db.$disconnect()
    server.close()
  })

  test('not found', async () => {
    await client('/api/fake').expect(404, {
      error: 'cannot GET /api/fake'
    })
  })
})
