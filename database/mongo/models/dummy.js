const Model = require('../types/model');

/**
 * Schema
    {
      email: {type: 'string'},
      age: {type: 'number},
      password: {type: 'string'},
      location: {
        type: {type: 'string', default: 'Point'},
        coordinates: [{type: 'number'}]
      },
    }
 */

class Dummy extends Model {
  constructor() {
    super('dummy', {
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

module.exports = new Dummy();
