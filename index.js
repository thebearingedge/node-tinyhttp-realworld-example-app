import 'dotenv/config.js'
import { createApi } from './api/create-api.js'

const app = createApi()

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log('listening on port', process.env.PORT)
})
