import { suite } from 'uvu'
import { authRouter } from './auth-router.js'

const Auth = suite('auth router')

Auth('true is true', () => {})

Auth.run()
