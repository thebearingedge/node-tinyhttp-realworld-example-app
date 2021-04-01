export const profileRoutes = (app, ajv) => {
  app
    .get('/api/profiles/:username', async (req, res) => {})
    .post('/api/profiles/:username/follow', async (req, res) => {})
    .delete('/api/profiles/:username/follow', async (req, res) => {})
}
