import { hash } from 'argon2'
import jwt from 'jsonwebtoken'
import { pick } from '../util/pick.js'
import { registration } from './auth-schemas.js'

export const authRoutes = (app, ajv, prisma) => {
  const validateRegistration = ajv.compile(registration)
  app
    .post('/api/users/login', async (req, res) => {})
    .post('/api/user', async (req, res) => {
      await validateRegistration(req.body)
      const {
        user: { email, username, password: unhashed }
      } = req.body
      const password = await hash(unhashed)
      const { id, profile } = await prisma.user.create({
        data: {
          email,
          password,
          profile: {
            create: {
              username
            }
          }
        },
        include: {
          profile: true
        }
      })
      const token = jwt.sign({ id }, process.env.TOKEN_SECRET)
      res.status(201).json({
        user: {
          email,
          username,
          token,
          ...pick(profile, ['username', 'bio', 'image'])
        }
      })
    })
    .get('/api/user', async (req, res) => {})
    .put('/api/user', async (req, res) => {})
}
