import jwt from 'jsonwebtoken'
import { json } from 'milliparsec'
import { hash, verify } from 'argon2'
import { requireAuth, validateBody } from '../util/middleware.js'

const parseJSON = json()

export const authRoutes = (app, ajv, prisma) => {
  const validateRegistration = validateBody(
    ajv.compile({
      $ref: 'swagger.json#/definitions/NewUserRequest'
    })
  )

  app.post('/api/users', parseJSON, validateRegistration, async (req, res) => {
    const {
      user: { email, username, password: unhashed }
    } = req.body
    const password = await hash(unhashed)
    const { userId, ...user } = await prisma.user.create({
      data: {
        email,
        password,
        username
      },
      select: {
        userId: true,
        email: true,
        username: true,
        bio: true,
        image: true
      }
    })
    const token = jwt.sign({ userId }, process.env.TOKEN_SECRET)
    res.status(201).json({
      user: {
        token,
        ...user
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
    const found = await prisma.user.findUnique({
      where: { email },
      select: {
        userId: true,
        email: true,
        password: true,
        username: true,
        bio: true,
        image: true
      }
    })
    if (!found) {
      res.status(401).json({
        error: 'invalid login'
      })
      return
    }
    const { userId, password: hashed, ...user } = found
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
        ...user,
        token
      }
    })
  })

  app.get('/api/user', requireAuth, async (req, res) => {
    const { userId } = req.user
    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        email: true,
        username: true,
        bio: true,
        image: true
      }
    })
    const token = req.get('Authorization').replace('Token ', '')
    res.json({
      user: {
        token,
        ...user
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
    requireAuth,
    parseJSON,
    validateUpdate,
    async (req, res) => {
      const { userId } = req.user
      const user = await prisma.user.update({
        data: req.body.user,
        where: { userId },
        select: {
          email: true,
          username: true,
          bio: true,
          image: true
        }
      })
      const token = req.get('Authorization').replace('Token ', '')
      res.json({
        user: {
          ...user,
          token
        }
      })
    }
  )
}
