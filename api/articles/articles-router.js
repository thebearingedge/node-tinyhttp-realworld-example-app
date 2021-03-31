import { App } from '@tinyhttp/app'

export const articlesRouter = new App()
  .get('/articles', async (req, res) => {})
  .post('/articles', async (req, res) => {})
  .get('/articles/feed', async (req, res) => {})
  .get('/articles/:slug', async (req, res) => {})
  .put('/articles/:slug', async (req, res) => {})
  .delete('/articles/:slug', async (req, res) => {})
  .get('/articles/:slug/comments', async (req, res) => {})
  .post('/articles/:slug/comments', async (req, res) => {})
  .delete('/articles/:slug/comments/:id', async (req, res) => {})
  .post('/articles/:slug/favorite', async (req, res) => {})
  .delete('/articles/:slug/favorite', async (req, res) => {})
