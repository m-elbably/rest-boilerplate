const _ = require('lodash');
const winston = require('winston');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
  ]
});

/**
 * @param options:
 * {
 *     autoLog: boolean
 * }
 * @returns {Function}
 */
module.exports = (options) => {
  function getHrTime(start) {
    const diff = process.hrtime(start);
    const result = diff[0] * 1e3 + diff[1] * 1e-6;
    return parseFloat(result.toFixed(2));
  }

  return async (ctx, next) => {
    if (!ctx._logger) {
      ctx._logger = { options };
    }

    const start = process.hrtime();
    ctx._logger.data = {
      level: 'info',
      user: 'public',
      message: 'AUTO',
      method: ctx.method,
      url: ctx.url,
      // client: ctx.headers.client,
      source: ctx.ip,
      status: 200,
      responseTime: start,
      timestamp: new Date(Date.now())
    };

    ctx._logger.log = function (level, message, payload) {
      let data = {};
      // Custom user log
      if (level && message) {
        data = _.merge({
          level,
          message,
          timestamp: new Date(Date.now()),
        }, payload);
      } else {
        const initialLog = this.data;
        data = _.merge(initialLog, {
          level,
          message,
          user: ctx.user,
          status: ctx.response.status,
          responseTime: getHrTime(initialLog.responseTime)
        });
      }

      logger.log(data.level, data);
    };

    await next();
  };
};
