module.exports = {
  idSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
    },
    required: ['id'],
    additionalProperties: false
  },
  dummySchema: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6, maxLength: 64 },
      age: { type: 'number', minimum: 16 },
      location: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['Point'],
          },
          coordinates: {
            type: 'array',
            minItems: 2,
            maxItems: 2,
            uniqueItems: true,
            items: {
              type: 'number',
              pattern: '^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$',
            },
          },
        },
        required: ['type', 'coordinates'],
        additionalProperties: false
      },
    },
    required: ['email', 'password', 'age'],
    additionalProperties: false
  },
};
