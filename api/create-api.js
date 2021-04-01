import Ajv from 'ajv'
import ajvErrors from 'ajv-errors'
import { App } from '@tinyhttp/app'
import { cors } from '@tinyhttp/cors'
import { json } from 'milliparsec'
import { tagsRouter } from './tags/tags-router.js'
import { authRoutes } from './auth/auth-routes.js'
import { profilesRouter } from './profiles/profiles-router.js'
import { articlesRouter } from './articles/articles-router.js'
import { onError, noMatchHandler } from './util/error-handlers.js'

export function createApi() {
  const ajv = ajvErrors(new Ajv({ allErrors: true }))

  const app = new App({
    onError,
    noMatchHandler
  })

  app.use(cors())
  app.use(json())

  authRoutes(app, ajv)

  return app
}
