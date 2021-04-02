import jwt from 'jsonwebtoken'
import { hash, verify } from 'argon2'
import { json } from 'milliparsec'
import { pick } from '../util/pick.js'
import { validateBody } from '../util/validate.js'
import { requireAuth } from '../util/require-auth.js'

const parseJSON = json()

export const authRoutes = (app, ajv, prisma) => {
  const validateRegistration = validateBody(
    ajv.compile({
      $ref: 'swagger.json#/definitions/NewUserRequest'
    })
  )

  const validateLogin = validateBody(
    ajv.compile({
      $ref: 'swagger.json#/definitions/LoginUserRequest'
    })
  )

  app
    .post('/api/users/login', parseJSON, validateLogin, async (req, res) => {
      const {
        user: { email, password: unhashed }
      } = req.body

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          profile: true
        }
      })

      if (!user) {
        res.status(401).json({
          error: 'invalid login'
        })
        return
      }

      const { id, password: hashed, profile } = user

      const isAuthenticated = await verify(hashed, unhashed)

      if (!isAuthenticated) {
        res.status(401).json({
          error: 'invalid login'
        })
        return
      }

      const token = jwt.sign({ id }, process.env.TOKEN_SECRET)

      res.status(201).json({
        user: {
          email,
          token,
          ...pick(profile, ['username', 'bio', 'image'])
        }
      })
    })
    .post('/api/user', parseJSON, validateRegistration, async (req, res) => {
      const {
        user: { email, username, password: unhashed }
      } = req.body

      const password = await hash(unhashed)

      const { userId, profile } = await prisma.user.create({
        data: {
          email,
          password,
          profile: {
            create: {
              username
            }
          }
        },
        select: {
          userId: true,
          profile: {
            select: {
              username: true,
              bio: true,
              image: true
            }
          }
        }
      })

      const token = jwt.sign({ userId }, process.env.TOKEN_SECRET)

      res.status(201).json({
        user: {
          email,
          token,
          ...profile
        }
      })
    })
    .get('/api/user', requireAuth, async (req, res) => {
      const { userId } = req.user

      const { email, profile } = await prisma.user.findUnique({
        where: { userId },
        select: {
          email: true,
          profile: {
            select: {
              username: true,
              bio: true,
              image: true
            }
          }
        }
      })

      const token = req.get('Authorization').replace('Token ', '')

      res.json({
        user: {
          email,
          token,
          ...profile
        }
      })
    })
    .put('/api/user', parseJSON, async (req, res) => {})
}
