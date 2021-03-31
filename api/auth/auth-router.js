import { App } from '@tinyhttp/app'

export const authRouter = new App()
  .post('/users/login', async (req, res) => {})
  .post('/users', async (req, res) => {})
  .get('/user', async (req, res) => {})
  .put('/user', async (req, res) => {})
