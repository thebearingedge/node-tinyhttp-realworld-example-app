import slugify from 'slugify'
import { json, requireAuth, validateBody } from '../util/middleware.js'

export const articleRoutes = (app, ajv, prisma) => {
  const validateNewArticle = validateBody(
    ajv.compile({
      $ref: 'swagger.json#/definitions/NewArticleRequest'
    })
  )

  app.get('/api/articles', async (req, res) => {
    // @TODO: Add favorited from req.query
    const { tag, author, limit, offset } = req.query

    const found = await prisma.article.findMany({
      take: Number(limit) || 20,
      skip: Number(offset) || 0,
      where: {
        tags: {
          some: {
            value: tag
          }
        },
        author: {
          is: {
            username: author
          }
        }
      },
      select: {
        slug: true,
        title: true,
        description: true,
        body: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        favoritesCount: true,
        // @TODO: If a users is logged in, check whether or not they favorited this article.
        // favorited: boolean
        author: {
          select: {
            username: true,
            bio: true,
            image: true
            // @TODO: If a users is logged in, check whether or not they follow this author.
            // following: boolean
          }
        }
      }
    })
    res.status(201).json({
      articles: found.map(
        ({ slug, title, description, body, tags, ...article }) => {
          return {
            slug,
            title,
            description,
            body,
            tagList: tags.map(({ value }) => value),
            ...article
          }
        }
      ),
      articlesCount: found.length
    })
  })

  app.post(
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
                where: { userId },
                select: { userId: true }
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

  app.get('/api/articles/:slug', async (req, res) => {
    const { slug } = req.params
    const userId = req.user?.userId
    const found = await prisma.article.findUnique({
      where: { slug },
      select: {
        slug: true,
        title: true,
        description: true,
        body: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        favoritesCount: true,
        favoritedBy: {
          where: { userId },
          select: { userId: true }
        },
        author: {
          select: {
            username: true,
            bio: true,
            image: true,
            followers: {
              where: { userId },
              select: { userId: true }
            }
          }
        }
      }
    })
    if (!found) {
      res.status(404).json({
        error: `cannot find article with slug "${slug}"`
      })
      return
    }
    const {
      tags,
      favoritedBy,
      author: { followers, ...author },
      ...article
    } = found
    res.json({
      article: {
        ...article,
        tagList: tags.map(({ value }) => value),
        favorited: !!favoritedBy.length,
        author: {
          ...author,
          followed: !!followers.length
        }
      }
    })
  })

  app.post('/api/articles/:slug/favorite', requireAuth, async (req, res) => {
    const { userId } = req.user
    const { slug } = req.params
    const found = await prisma.article.findUnique({
      where: { slug },
      select: { articleId: true }
    })
    if (!found) {
      res.status(404).json({
        error: `cannot find article with slug "${slug}"`
      })
      return
    }
    const {
      tags,
      author: { followers, ...author },
      ...article
    } = await prisma.article.update({
      where: { slug },
      data: {
        favoritesCount: {
          increment: 1
        },
        favoritedBy: {
          connect: { userId }
        }
      },
      select: {
        slug: true,
        title: true,
        description: true,
        body: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        favoritesCount: true,
        author: {
          select: {
            username: true,
            bio: true,
            image: true,
            followers: {
              where: { userId },
              select: { userId: true }
            }
          }
        }
      }
    })
    res.status(200).json({
      article: {
        ...article,
        favorited: true,
        tagList: tags.map(({ value }) => value),
        author: {
          ...author,
          following: !!followers.length
        }
      }
    })
  })

  app.delete('/api/articles/:slug/favorite', requireAuth, async (req, res) => {
    const { userId } = req.user
    const { slug } = req.params
    const found = await prisma.article.findUnique({
      where: { slug },
      select: { articleId: true }
    })
    if (!found) {
      res.status(404).json({
        error: `cannot find article with slug "${slug}"`
      })
      return
    }
    const {
      tags,
      author: { followers, ...author },
      ...article
    } = await prisma.article.update({
      where: { slug },
      data: {
        favoritesCount: {
          decrement: 1
        },
        favoritedBy: {
          disconnect: { userId }
        }
      },
      select: {
        slug: true,
        title: true,
        description: true,
        body: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        favoritesCount: true,
        author: {
          select: {
            username: true,
            bio: true,
            image: true,
            followers: {
              where: { userId },
              select: { userId: true }
            }
          }
        }
      }
    })
    res.json({
      article: {
        ...article,
        favorited: false,
        tagList: tags.map(({ value }) => value),
        author: {
          ...author,
          following: !!followers.length
        }
      }
    })
  })

  const validateUpdateArticle = validateBody(
    ajv.compile({
      $ref: 'swagger.json#/definitions/UpdateArticleRequest'
    })
  )

  app
    .put(
      '/api/articles/:slug',
      requireAuth,
      json(),
      validateUpdateArticle,
      async (req, res) => {
        const { userId } = req.user
        const { slug } = req.params
        const found = await prisma.article.findFirst({
          where: { userId, slug }
        })
        if (!found) {
          res.status(404).json({
            error: `cannot update article "${slug}"`
          })
          return
        }
        const data = {
          ...req.body.article
        }
        if (req.body.article.title) {
          data.slug = slugify(req.body.article.title, { lower: true })
        }
        const {
          tags,
          author: { followers, ...author },
          ...article
        } = await prisma.article.update({
          where: { slug },
          data,
          select: {
            slug: true,
            title: true,
            description: true,
            body: true,
            tags: true,
            createdAt: true,
            updatedAt: true,
            favoritesCount: true,
            author: {
              select: {
                username: true,
                bio: true,
                image: true,
                followers: {
                  where: { userId },
                  select: { userId: true }
                }
              }
            }
          }
        })
        res.json({
          article: {
            ...article,
            favorited: false,
            tagList: tags.map(({ value }) => value),
            author: {
              ...author,
              following: !!followers.length
            }
          }
        })
      }
    )
    .delete('/api/articles/:slug', async (req, res) => {})
    .get('/api/articles/:slug/comments', async (req, res) => {})
    .post('/api/articles/:slug/comments', async (req, res) => {})
    .delete('/api/articles/:slug/comments/:id', async (req, res) => {})
    .get('/api/articles/feed', async (req, res) => {})
}
