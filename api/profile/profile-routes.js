import { requireAuth } from '../util/middleware.js'

export const profileRoutes = (app, ajv, prisma) => {
  app
    .get('/api/profiles/:username', async (req, res) => {
      const userId = req.user?.userId
      const { username } = req.params
      const found = await prisma.user.findUnique({
        where: { username },
        select: {
          username: true,
          bio: true,
          image: true,
          followers: {
            where: { userId },
            select: { userId: true }
          }
        }
      })
      if (!found) {
        res.status(404).json({
          error: `cannot find profile with username '${username}'`
        })
        return
      }
      const { followers, ...profile } = found
      res.json({
        profile: {
          ...profile,
          following: !!followers.length
        }
      })
    })
    .post('/api/profiles/:username/follow', requireAuth, async (req, res) => {
      const { userId } = req.user
      const { username } = req.params
      const profile = await prisma.user.findUnique({
        where: { username },
        select: {
          username: true,
          bio: true,
          image: true
        }
      })
      if (!profile) {
        res.status(404).json({
          error: `cannot find profile with username "${username}"`
        })
        return
      }
      await prisma.user.update({
        where: { username },
        data: {
          followers: {
            connect: {
              userId
            }
          }
        }
      })
      res.json({
        profile: {
          ...profile,
          following: true
        }
      })
    })
    .delete('/api/profiles/:username/follow', requireAuth, async (req, res) => {
      const { userId } = req.user
      const { username } = req.params
      const profile = await prisma.user.findUnique({
        where: { username },
        select: {
          username: true,
          bio: true,
          image: true
        }
      })
      if (!profile) {
        res.status(404).json({
          error: `cannot find profile with username "${username}"`
        })
        return
      }
      await prisma.user.update({
        where: { username },
        data: {
          followers: {
            disconnect: {
              userId
            }
          }
        }
      })
      res.json({
        profile: {
          ...profile,
          following: false
        }
      })
    })
}
