export const requireAuth = (req, res, next) => {
  if (req.user) return next()
  res.status(401).json({
    error: 'authentication required'
  })
}
