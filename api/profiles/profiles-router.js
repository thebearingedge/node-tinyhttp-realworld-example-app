import { createRouter } from '../util/create-router.js'

export const profilesRouter = createRouter()
  .get('/api/profiles/:username', async (req, res) => {})
  .post('/api/profiles/:username/follow', async (req, res) => {})
  .delete('/api/profiles/:username/follow', async (req, res) => {})
