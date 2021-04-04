import Prisma from '@prisma/client'
import chai from 'chai'
import { chaiStruct } from 'chai-struct'
import { suite as uvuSuite } from 'uvu'
import { makeFetch } from 'supertest-fetch'
import { ajv } from './ajv-swagger.js'
import { createApi } from '../create-api.js'

chai.use(chaiStruct)

const { expect } = chai

const prisma = new Prisma.PrismaClient()
const app = createApi({ ajv, prisma })
const server = app.listen()
const fetch = makeFetch(server)

const entities = ['tag', 'comment', 'article', 'user']

export { expect }

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
