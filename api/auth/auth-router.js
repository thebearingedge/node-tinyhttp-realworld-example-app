import { createRouter } from '../util/create-router.js'

export const authRouter = createRouter()
  .post('/api/users/login', async (req, res) => {})
  .post('/api/users', async (req, res) => {})
  .get('/api/user', async (req, res) => {})
  .put('/api/user', async (req, res) => {})
