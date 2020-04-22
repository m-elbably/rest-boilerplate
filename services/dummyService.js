const _ = require('lodash');
const BaseService = require('./baseService.js');
const { Dummy } = require('../database/mongo/models');
const crypto = require('../core/common/crypto');
const { ValidationError, NotFoundError } = require('../core/common/errors');

class DummyService extends BaseService {
  constructor() {
    super(Dummy);
  }

  async create(body, files = {}) {
    if (!_.isNil(body.password)) {
      body.password = await crypto.createHash(body.password);
    }

    return super.create(body)
      .then(async (user) => {
        const token = await crypto.createJwtToken({
          sub: user.email,
          roles: ['user']
        });

        return { token, user };
      });
  }

  async find(filter = {}, params = {}) {
    const query = {};
    const { age } = params;

    if (age) {
      query.age = parseInt(age);
    }

    return super.find(query, params);
  }
}

module.exports = new DummyService();
