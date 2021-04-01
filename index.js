import 'dotenv/config.js'
import { createApi } from './api/create-api.js'
import { PrismaClient } from '@prisma/client'

const app = createApi()
const db = new PrismaClient()

app.locals.db = db

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log('listening on port', process.env.PORT)
})
