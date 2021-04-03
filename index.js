import 'dotenv/config.js'
import Prisma from '@prisma/client'
import { createApi } from './api/create-api.js'

const app = createApi(new Prisma.PrismaClient())

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log('listening on port', process.env.PORT)
})
