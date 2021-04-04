import slugify from 'slugify'
import { json } from 'milliparsec'
import { requireAuth, validateBody } from '../util/middleware.js'

export const articleRoutes = (app, ajv, prisma) => {
  const validateNewArticle = validateBody(
    ajv.compile({
      $ref: 'swagger.json#/definitions/NewArticleRequest'
    })
  )

  app
    .post(
      '/api/articles',
      requireAuth,
      json(),
      validateNewArticle,
      async (req, res, next) => {
        const { userId } = req.user
        const {
          article: { title, tagList, ...body }
        } = req.body
        const slug = slugify(title, { lower: true })
        const {
          author: { followers, ...author },
          ...article
        } = await prisma.article.create({
          data: {
            userId,
            title,
            slug,
            ...body,
            author: {
              connect: { userId }
            },
            tags: {
              connectOrCreate: tagList.map(value => ({
                where: { value },
                create: { value }
              }))
            }
          },
          select: {
            title: true,
            description: true,
            slug: true,
            body: true,
            createdAt: true,
            updatedAt: true,
            author: {
              select: {
                username: true,
                image: true,
                bio: true,
                followers: {
                  where: { userId }
                }
              }
            }
          }
        })
        res.status(201).json({
          article: {
            ...article,
            tagList,
            favorited: false,
            favoritesCount: 0,
            author: {
              ...author,
              following: !!followers.length
            }
          }
        })
      }
    )
    .get('/api/articles/feed', async (req, res) => {})
    .get('/api/articles/:slug', async (req, res) => {})
    .put('/api/articles/:slug', async (req, res) => {})
    .delete('/api/articles/:slug', async (req, res) => {})
    .get('/api/articles/:slug/comments', async (req, res) => {})
    .post('/api/articles/:slug/comments', async (req, res) => {})
    .delete('/api/articles/:slug/comments/:id', async (req, res) => {})
    .post('/api/articles/:slug/favorite', async (req, res) => {})
    .delete('/api/articles/:slug/favorite', async (req, res) => {})
}
