import { App } from '@tinyhttp/app'

export const profilesRouter = new App()
  .get('/profiles/:username', async (req, res) => {})
  .post('/profiles/:username/follow', async (req, res) => {})
  .delete('/profiles/:username/follow', async (req, res) => {})
