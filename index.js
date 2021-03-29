import { App } from '@tinyhttp/app'

const app = new App()

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log('listening on port', process.env.PORT)
})
