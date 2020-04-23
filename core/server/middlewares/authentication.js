const crypto = require('../../common/crypto');
const { UnauthenticatedError } = require('../../common/errors');

const HKEY = 'Bearer';

module.exports = () => async (ctx, next) => {
  try {
    const { authorization } = ctx.request.headers;
    if (!authorization) {
      ctx.user = { _id: null, roles: ['public'] };
      return await next();
    }

    const authParts = authorization.split(/\s/);
    if (authParts.length < 2 || authParts[0] !== HKEY) {
      throw new UnauthenticatedError('Invalid authorization header');
    }

    const jwtPayload = await crypto.verifyJwtToken(authParts[1]);
    if (jwtPayload) {
      ctx.user = { _id: jwtPayload.sub, roles: jwtPayload.roles };
      return await next();
    }

    throw new UnauthenticatedError();
  } catch (err) {
    throw err;
  }
};
