import 'dotenv/config.js'
import { createApi } from './api/create-api.js'
import Prisma from '@prisma/client'

const prisma = new Prisma.PrismaClient()
const app = createApi(prisma)

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log('listening on port', process.env.PORT)
})
