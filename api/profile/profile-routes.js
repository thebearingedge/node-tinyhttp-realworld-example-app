import { requireAuth } from '../util/require-auth.js'

export const profileRoutes = (app, ajv, prisma) => {
  app
    .get('/api/profiles/:username', async (req, res) => {
      const userId = req.user?.userId
      const { username } = req.params
      const found = await prisma.profile.findUnique({
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
      const { userId: profileId } = await prisma.profile.findUnique({
        where: { username },
        select: { userId: true }
      })
      const { profile } = await prisma.follow.upsert({
        where: { profileId_userId: { userId, profileId } },
        create: { userId, profileId },
        update: { userId, profileId },
        select: {
          profile: {
            select: {
              username: true,
              bio: true,
              image: true
            }
          }
        }
      })
      res.status(201).json({
        profile: {
          ...profile,
          following: true
        }
      })
    })
    .delete(
      '/api/profiles/:username/follow',
      requireAuth,
      async (req, res) => {}
    )
}
