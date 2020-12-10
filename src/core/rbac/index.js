const _ = require('lodash');

const models = require('./models');
const { UnauthorizedError, ValidationError } = require('../../common/errors');

const { Role } = models;

class Authorization {
    constructor() {
        this._roles = {};
    }

    async _registerModels(database) {
        const promises = [];
        models.forEach((m) => promises.push(database.registerModel(m)));
        return Promise.all(promises);
    }

    async _migrate() {

    }

    async _loadRoles() {
        // Load roles from db
        this._roles = {};
    }

    async initialize(database) {
        await this._registerModels(database);
        await this._migrate();
        await this._loadRoles();
    }

    async authorize(user, resource, access, predicate) {

    }

    async filterByPermission(permission, object, path) {

    }
}

module.exports = new Authorization();
