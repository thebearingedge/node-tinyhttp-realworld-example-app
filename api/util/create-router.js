import { App } from '@tinyhttp/app'
import { onError, noMatchHandler } from './error-handlers.js'

export function createRouter() {
  return new App({
    onError: onError,
    noMatchHandler: noMatchHandler
  })
}
