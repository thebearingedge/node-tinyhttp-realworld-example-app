export const tagRoutes = (app, prisma) => {
  app.get('/api/tags', async (req, res) => {
    const tags = await prisma.tag.findMany()
    res.json({
      tags: tags.map(({ value }) => value)
    })
  })
}
