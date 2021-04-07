import Ajv from 'ajv'

export { json } from 'milliparsec'

export const requireAuth = (req, res, next) => {
  if (req.user) return next()
  res.status(401).json({
    error: 'authentication required'
  })
}

export const validateBody = validate => (req, res, next) => {
  if (validate(req.body)) return next()
  next(new Ajv.ValidationError(validate.errors))
}
