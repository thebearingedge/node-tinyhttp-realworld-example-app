import { App } from '@tinyhttp/app'
import { cors } from '@tinyhttp/cors'
import { tagsRouter } from './tags/tags-router.js'
import { authRouter } from './auth/auth-router.js'
import { profilesRouter } from './profiles/profiles-router.js'
import { articlesRouter } from './articles/articles-router.js'
import { onError, noMatchHandler } from './util/error-handlers.js'

export function createApi() {
  const app = new App({
    onError,
    noMatchHandler
  })

  app.use(
    '/api',
    cors(),
    authRouter,
    tagsRouter,
    articlesRouter,
    profilesRouter
  )

  return app
}
