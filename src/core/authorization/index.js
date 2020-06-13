const _ = require('lodash');
const AccessControl = require('accesscontrol');

const { aclRoles, aclResources } = require('./accessList');
const { UnauthorizedError, ValidationError } = require('../../common/errors');

const ACCESS_TYPES = ['createOwn', 'createAny', 'readOwn', 'readAny', 'updateOwn', 'updateAny', 'deleteOwn', 'deleteAny'];

class Authorization {
    constructor() {
        // this.roles = roles;
        // this.resources = resources;
        this.accessType = ACCESS_TYPES;
        this.acl = new AccessControl(aclRoles);
    }

    async _getAccess(roles, resource, access, predicate) {
        let permission;
        let allowed = false;
        let userAccess;
        let nAccess = access;

        if (_.isString(access)) {
            nAccess = [access];
        }

        if (!nAccess || _.intersection(nAccess, this.accessType).length !== nAccess.length) {
            throw new ValidationError('Missing or invalid authorization access type');
        }

        for (let i = 0; i < nAccess.length; i += 1) {
            permission = this.acl.can(roles)[nAccess[i]](resource);
            if (permission.granted) {
                userAccess = nAccess[i];
                if (!_.isNil(predicate)) {
                    if (userAccess.toLowerCase().endsWith('own')) {
                        // eslint-disable-next-line no-await-in-loop
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
    }

    async authorize(user, resource, access, predicate) {
        if (_.isNil(user)) {
            throw new UnauthorizedError();
        }

        const { roles } = user;
        const { permission, allowed } = await this._getAccess(roles, resource, access, predicate);

        if (permission.granted === true && allowed === true) {
            return permission;
        }

        throw new UnauthorizedError();
    }

    async filterByPermission(permission, object, path) {
        if (permission && permission.granted) {
            if (path) {
                _.set(object, path, permission.filter(_.get(object, path)));
            }
        }
    }
}

module.exports = new Authorization();
