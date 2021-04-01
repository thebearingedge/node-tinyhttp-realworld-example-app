import { registration } from './auth-schemas.js'

export const authRoutes = (app, ajv) => {
  const validateRegistration = ajv.compile(registration)
  app
    .post('/api/users/login', async (req, res) => {})
    .post('/api/users', async (req, res) => {
      await validateRegistration(req.body)
    })
    .get('/api/user', async (req, res) => {})
    .put('/api/user', async (req, res) => {})
}
