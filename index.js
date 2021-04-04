import 'dotenv/config.js'
import Prisma from '@prisma/client'
import { ajv } from './api/util/ajv-swagger.js'
import { createApi } from './api/create-api.js'

const prisma = new Prisma.PrismaClient()

createApi({ ajv, prisma }).listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log('listening on port', process.env.PORT)
})
