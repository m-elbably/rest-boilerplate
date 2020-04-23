const { NotFoundError } = require('../../common/errors');

module.exports = () => async (ctx, next) => {
  if (ctx.status === 404) {
    throw new NotFoundError();
  }

  next();
};
