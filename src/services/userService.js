const _ = require('lodash');
const BaseService = require('../core/baseService.js');
const { User } = require('../database/mongo/models');
const crypto = require('../common/crypto');
const { ValidationError, NotFoundError } = require('../common/errors');

class UserService extends BaseService {
    constructor() {
        super(User);
    }

    async create(body, files = {}) {
        const data = { ...body };
        if (!_.isNil(body.password)) {
            data.password = await crypto.createHash(body.password);
        }

        if (files) {
            console.log('You can do whatever with the files here');
        }

        return super.create(data)
            .then(async (user) => {
                const token = await crypto.createJwtToken({
                    sub: String(user._id),
                    roles: ['user']
                });

                return { token, user, _i: { dataPath: 'user' } };
            });
    }

    async find(filter = {}, params = {}) {
        try {
            const query = {};
            const { age } = params;

            if (age) {
                query.age = parseInt(age, 10);
            }
            if (filter) {
                console.log('Do something with filter');
            }

            return super.find(query, params);
        } catch (e) {
            throw new NotFoundError(e);
        }
    }
}

module.exports = new UserService();
