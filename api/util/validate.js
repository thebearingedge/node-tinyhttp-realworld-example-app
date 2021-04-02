import Ajv from 'ajv'

export const validateBody = validate => (req, res, next) => {
  if (validate(req.body)) return next()
  next(new Ajv.ValidationError(validate.errors))
}
