import jwt from 'jsonwebtoken'
import { json } from 'milliparsec'
import { hash, verify } from 'argon2'
import { validateBody } from '../util/validate.js'
import { requireAuth } from '../util/require-auth.js'

const parseJSON = json()

export const authRoutes = (app, ajv, prisma) => {
  const validateRegistration = validateBody(
    ajv.compile({
      $ref: 'swagger.json#/definitions/NewUserRequest'
    })
  )

  app.post('/api/user', parseJSON, validateRegistration, async (req, res) => {
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

  const validateLogin = validateBody(
    ajv.compile({
      $ref: 'swagger.json#/definitions/LoginUserRequest'
    })
  )

  app.post('/api/users/login', parseJSON, validateLogin, async (req, res) => {
    const {
      user: { email, password: unhashed }
    } = req.body
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        userId: true,
        password: true,
        profile: {
          select: {
            username: true,
            bio: true,
            image: true
          }
        }
      }
    })
    if (!user) {
      res.status(401).json({
        error: 'invalid login'
      })
      return
    }
    const { userId, password: hashed, profile } = user
    const isAuthenticated = await verify(hashed, unhashed)
    if (!isAuthenticated) {
      res.status(401).json({
        error: 'invalid login'
      })
      return
    }
    const token = jwt.sign({ userId }, process.env.TOKEN_SECRET)
    res.status(201).json({
      user: {
        email,
        token,
        ...profile
      }
    })
  })

  app.get('/api/user', requireAuth, async (req, res) => {
    const { userId } = req.user
    const token = req.get('Authorization').replace('Token ', '')
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
    res.json({
      user: {
        token,
        email,
        ...profile
      }
    })
  })

  const validateUpdate = validateBody(
    ajv.compile({
      $ref: 'swagger.json#/definitions/UpdateUserRequest'
    })
  )

  app.put(
    '/api/user',
    parseJSON,
    requireAuth,
    validateUpdate,
    async (req, res) => {
      const { userId } = req.user
      const { email: _email, ..._profile } = req.body.user
      const data = {
        email: _email,
        profile: {
          update: {
            ..._profile
          }
        }
      }
      const token = req.get('Authorization').replace('Token ', '')
      const { email, profile } = await prisma.user.update({
        data,
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
      res.json({
        user: {
          token,
          email,
          ...profile
        }
      })
    }
  )
}
