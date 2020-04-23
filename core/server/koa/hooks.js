const _ = require('lodash');
const Validator = require('ajv');
const { accessControl, accessType } = require('../../authorization');
const { ValidationError, UnauthorizedError } = require('../../common/errors');

const validator = new Validator();

module.exports = {
  validate: (schema, data, strict = true) => {
    const nSchema = schema;

    if (!strict) {
      delete nSchema.required;
    }

    const valid = validator.validate(nSchema, data);
    if (!valid) {
      throw new ValidationError(null, validator.errors);
    }
  },
  async getAccess(roles, resource, access, predicate) {
    let permission;
    let allowed = false;
    let userAccess;
    let nAccess = access;
    if (_.isString(access)) {
      nAccess = [access];
    }

    if (_.intersection(nAccess, accessType).length !== nAccess.length) {
      throw new Error('invalid access type');
    }

    for (let i = 0; i < nAccess.length; i += 1) {
      permission = accessControl.can(roles)[nAccess[i]](resource);
      if (permission.granted) {
        userAccess = nAccess[i];
        if (!_.isNil(predicate)) {
          if (userAccess.toLowerCase().endsWith('own')) {
            const result = await predicate();

            if (result) {
              allowed = true;
              break;
            }

            break;
          }
        }

        allowed = true;
        break;
      }
    }

    return { permission, allowed };
  },
  async authorize(user, resource, access, predicate) {
    try {
      if (_.isNil(user)) {
        throw new UnauthorizedError();
      }

      _.merge(this._locals, { resource });

      const { roles } = user;
      const permission = await this.getAccess(roles, resource, access, predicate);

      if (permission.granted === true) {
        const { attributes } = permission;

        if (attributes.length === 0 || (attributes.length === 0 && attributes[0] === '*')) {
          return;
        }

        if (!_.isNil(this.request.body)) {
          this.request.body = permission.filter(this.request.body);
        }
      } else {
        throw new UnauthorizedError();
      }
    } catch (err) {
      throw err;
    }
  },
  filter(user, resource, data, dataPath) {
    try {
      if (_.isNil(user)) {
        return data;
      }

      const { roles } = user;
      let permission = accessControl.can(roles).readAny(resource);
      if (!permission.granted) {
        permission = accessControl.can(roles).readOwn(resource);
      }

      if (permission.granted) {
        if (dataPath) {
          data[dataPath] = permission.filter(data[dataPath]);
          return data;
        }

        return permission.filter(data);
      }
    } catch (err) {
      throw err;
    }
  }
};
