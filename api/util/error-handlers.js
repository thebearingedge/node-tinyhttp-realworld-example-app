// import { ValidationError } from 'ajv'

export const onError = (err, req, res) => {
  if (err instanceof Error) {
    res.status(422).json({})
  } else {
    console.error(err)
    res.status(500).json({
      error: 'an unexpected error occurred'
    })
  }
}

export const noMatchHandler = (req, res) => {
  res.status(404).json({
    error: `cannot ${req.method} ${req.url}`
  })
}
