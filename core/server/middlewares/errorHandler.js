const utils = require('../../common/utils');

module.exports = () => async (ctx, next) => {
    try {
        // Some ctx initializations
        ctx['_locals'] = {};
        // Wait for other middlewares
        await next();
        // Finally log data
        if(ctx._logger && ctx._logger.options && ctx._logger.options.autoLog === true) {
            ctx._logger.log();
        }
    } catch (err) {
        const payload = {
            code: err.code || 0,
            name: err.name,
            message: err.message || 'Error',
        };

        ctx.status = err.status || 500;
        // ajv errors
        if (err.status && err.status === 400) {
            // Handle ajv errors
            if (Array.isArray(err.errors)) {
                payload.details = err.errors;
                payload.message = 'validation error(s)';
            }
        }

        if (utils.inDevelopment()) {
            payload.stack = JSON.stringify(err.stack);
            console.log(err.stack);
        }

        if(ctx._logger) {
            ctx._logger.log('error', err.message);
        }
        ctx.body = payload;
    }
};
