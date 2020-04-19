const _ = require('lodash');

const crypto = require('../../common/crypto');
const { User } = require('../../database/mongo/models');
const { UnauthenticatedError, ValidationError } = require('../../common/errors');

const findAndValidateUser = async (id, roles) => {
    if (_.indexOf(roles, 'public') >= 0) {
        return {
            _id: null,
            roles: ['public']
        };
    }

    const user = await User.findById(id, { projection: { roles: 1, blocked: 1 } });
    if (!_.isNull(user)) {
        if (user.blocked) {
            throw new UnauthenticatedError('User account is blocked');
        }

        return _.set(user, '_id', String(user._id));
    }

    throw new UnauthenticatedError('Invalid user account');
};

module.exports = () => async (ctx, next) => {
    const authorization = _.get(ctx, 'request.header.authorization');

    if (_.isNil(authorization)) {
        const user = await findAndValidateUser(null, ['public']);
        _.set(ctx, '_locals.user', user);
        return next();
    }

    let token = '';
    const authParts = authorization.split(' ');
    if (authParts.length === 2) {
        const scheme = authParts[0];
        const credentials = authParts[1];
        if (/^Bearer$/i.test(scheme)) {
            token = credentials;
        }
    } else {
        throw new ValidationError('Invalid authorization header format. Valid format should be "Authorization: Bearer [token]"');
    }

    const jwtPayload = await crypto.verifyJwtToken(token);
    if (jwtPayload) {
        const user = await findAndValidateUser(jwtPayload.sub, jwtPayload.roles);
        _.set(ctx, '_locals.user', user);
        return next();
    }

    throw new UnauthenticatedError();
};
