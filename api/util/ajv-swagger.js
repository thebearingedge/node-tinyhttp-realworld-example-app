import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Ajv from 'ajv'
import ajvErrors from 'ajv-errors'

const pathToSwaggerJSON = fileURLToPath(path.dirname(import.meta.url))
const swaggerJSON = fs.readFileSync(
  path.join(pathToSwaggerJSON, '..', 'swagger.json'),
  'utf8'
)

const swagger = JSON.parse(swaggerJSON)

const ajv = ajvErrors(
  new Ajv({
    allErrors: true,
    removeAdditional: true,
    keywords: [
      'swagger',
      'info',
      'basePath',
      'schemes',
      'produces',
      'consumes',
      'securityDefinitions',
      'paths'
    ],
    formats: {
      password: val => !!val.length,
      'date-time': /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/
    }
  })
)

ajv.addSchema(swagger, 'swagger.json')

export { ajv }
