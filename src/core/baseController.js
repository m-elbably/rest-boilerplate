const _ = require('lodash');

const validation = require('./validation');
const authorization = require('./authorization');
const { UnexpectedError } = require('../common/errors');

class BaseController {
    constructor(config) {
        const {
            name, path, service, routes
        } = config;

        this.name = name;
        this.path = path;
        this.service = service;
        this.routes = routes || [];
    }

    async _filterBody(ctx) {
        // Filter response if possible
        const body = _.get(ctx.response, 'body');
        const permission = _.get(ctx._locals, 'permission');

        let path = 'body';
        const bodyDescriptor = _.get(ctx, 'response.body._i');
        if (bodyDescriptor) {
            path = `body.${bodyDescriptor.dataPath}`;
            _.unset(ctx, 'response.body._i');
        }

        if (body && permission) {
            if (permission.attributes.length > 0 && !(permission.attributes.length === 1 && permission.attributes[0] === '*')) {
                await authorization.filterByPermission(permission, ctx.response, path);
            }
        }
    }

    async beforeAction(ctx, next) {
        // Add resource name to local variables
        _.set(ctx, '_locals.resource', this.name);
        // Apply hooks to context
        _.set(ctx, 'validate', this.validate);
        _.set(ctx, 'authorize', this.authorize.bind(ctx));

        await next();
    }

    async afterAction(ctx, next) {
        await next();

        // Filter response body based on user permission (if possible)
        await this._filterBody(ctx);
    }

    // Context Hooks ////
    async authorize(access, predicate) {
        if (_.isNil(this) || _.isNil(this._locals)) {
            throw new UnexpectedError('Authorize should be called from context');
        }

        const { user, resource } = this._locals;
        const permission = await authorization.authorize(user, resource, access, predicate);
        // Store permission for "afterAction" to be used for filtering
        _.set(this, '_locals.permission', permission);
        await authorization.filterByPermission(permission, this.request, 'body');
    }

    async validate(schema, data, strict = true) {
        validation.validate(schema, data, strict);
    }
}

module.exports = BaseController;
