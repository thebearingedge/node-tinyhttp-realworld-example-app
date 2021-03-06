import Ajv from 'ajv'
import { App } from '@tinyhttp/app'
import { jwt } from '@tinyhttp/jwt'
import { cors } from '@tinyhttp/cors'
import { tagRoutes } from './tag/tag-routes.js'
import { authRoutes } from './auth/auth-routes.js'
import { profileRoutes } from './profile/profile-routes.js'
import { articleRoutes } from './article/article-routes.js'

export function createApi({ prisma, ajv }) {
  const app = new App({
    onError,
    noMatchHandler
  })

  app.use(cors())
  app.use(
    jwt({
      algorithm: 'HS256',
      secret: process.env.TOKEN_SECRET
    })
  )

  tagRoutes(app, prisma)
  authRoutes(app, ajv, prisma)
  profileRoutes(app, ajv, prisma)
  articleRoutes(app, ajv, prisma)

  return app
}

const onError = (err, req, res) => {
  if (err instanceof Ajv.ValidationError) {
    res.status(422).json({
      errors: {
        body: err.errors.map(({ message }) => message)
      }
    })
  } /* c8 ignore start */ else {
    console.error(err)
    res.status(500).json({
      error: 'an unexpected error occurred'
    })
  } /* c8 ignore stop */
}

const noMatchHandler = (req, res) => {
  res.status(404).json({
    error: `cannot ${req.method} ${req.url}`
  })
}
