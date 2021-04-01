import prisma from '@prisma/client'
import { suite as uvuSuite } from 'uvu'
import { makeFetch } from 'supertest-fetch'
import { createApi } from '../create-api.js'

const db = new prisma.PrismaClient()
const app = createApi()
const server = app.listen()
const client = makeFetch(server)

export const suite = (name, context, register) => {
  if (typeof register === 'undefined') {
    register = context
    context = undefined
  }

  const test = uvuSuite(name, {
    ...context,
    db,
    client
  })

  test.after(async () => {
    server.close()
    await db.$disconnect()
  })

  test.before.each(async () => {
    const deletions = Object.keys(db)
      .filter(key => !key.startsWith('_'))
      .map(entity => db[entity].deleteMany())
    await db.$transaction(deletions)
  })

  register(test)

  test.run()
}
