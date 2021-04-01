import { App } from '@tinyhttp/app'
import { onError, noMatchHandler } from './error-handlers.js'

export const createRouter = () => {
  return new App({
    onError: onError,
    noMatchHandler: noMatchHandler
  })
}
