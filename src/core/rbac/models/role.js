const Model = require('../../../database/mongo/types/model');

/**
 * Schema
 {
      name: {type: 'string'},
      permissions: [{
          subject: {
            action: {type: 'string'},
            fields: [{type: 'string'}],
            conditions: {type: 'object'}
          }
      }],
      isActive: {type: 'boolean'}
    }
 */

class Role extends Model {
    constructor() {
        super('roles', {
            timestamp: true,
            indexes: [
                { fields: { name: 1 } }
            ]
        });
    }
}

module.exports = new Role();
