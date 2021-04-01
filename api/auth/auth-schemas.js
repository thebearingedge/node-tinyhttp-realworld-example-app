export const registration = {
  $async: true,
  type: 'object',
  additionalProperties: false,
  properties: {
    user: {
      type: 'object',
      additionalProperties: false,
      properties: {
        email: {
          type: 'string'
        },
        username: {
          type: 'string'
        },
        password: {
          type: 'string'
        }
      },
      required: ['email', 'username', 'password']
    }
  },
  required: ['user']
}
