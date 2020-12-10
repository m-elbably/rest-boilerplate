const Model = require('../types/model');

/**
 * Schema
    {
      name: {type: 'string'},
      email: {type: 'string'},
      age: {type: 'number},
      password: {type: 'string'},
      location: {
        type: {type: 'string', default: 'Point'},
        coordinates: [{type: 'number'}]
      },
      blocked: {type: 'boolean'}
    }
 */
class User extends Model {
    constructor() {
        super('users', {
            timestamp: true,
            indexes: [
                { fields: { email: 1 } },
                {
                    fields: { location: '2dsphere' },
                    options: { sparse: true }
                },
            ]
        });
    }
}

module.exports = new User();
