import slugify from 'slugify'
import { json } from 'milliparsec'
import { validateBody } from '../util/validate.js'
import { requireAuth } from '../util/require-auth.js'

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
          articleId,
          author: { followers, ...author },
          ...article
        } = await prisma.article.create({
          data: {
            userId,
            title,
            slug,
            ...body
          },
          select: {
            articleId: true,
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
        await prisma.tag.createMany({
          data: tagList.map(value => ({ value })),
          skipDuplicates: true
        })
        await prisma.articleTag.createMany({
          data: tagList.map(value => ({
            tagValue: value,
            articleId
          })),
          skipDuplicates: true
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
