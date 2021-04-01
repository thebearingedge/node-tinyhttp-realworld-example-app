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

  app.use(cors())
  app.use(tagsRouter)
  app.use(authRouter)
  app.use(profilesRouter)
  app.use(articlesRouter)
  app.use(noMatchHandler)

  return app
}
