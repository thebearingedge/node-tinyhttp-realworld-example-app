import Prisma from '@prisma/client'
import { suite as uvuSuite } from 'uvu'
import { makeFetch } from 'supertest-fetch'
import { createApi } from '../create-api.js'

const prisma = new Prisma.PrismaClient()
const app = createApi(prisma)
const server = app.listen()
const fetch = makeFetch(server)

const entities = ['follow', 'profile', 'user']

export const suite = (suiteName, context, register) => {
  if (typeof register === 'undefined') {
    register = context
    context = undefined
  }

  const test = uvuSuite(suiteName, {
    ...context,
    prisma,
    fetch
  })

  test.after(async () => {
    server.close()
    await prisma.$disconnect()
  })

  test.before.each(async () => {
    for (const entity of entities) {
      await prisma[entity].deleteMany()
    }
  })

  register(test)

  test.run()
}
