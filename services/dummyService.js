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
    const dummyData = { ...body };
    if (!_.isNil(body.password)) {
      dummyData.password = await crypto.createHash(body.password);
    }

    if (files) {
      console.log('You can do whatever with the files here');
    }
    return super.create(dummyData)
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
