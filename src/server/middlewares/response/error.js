/* eslint no-undef: 0 */
module.exports = () => async (ctx, next) => {
    try {
        await next();
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

        if (Api.params.inDevelopment) {
            payload.stack = JSON.stringify(err.stack);
            Api.log.error(err.stack);
        }

        if (ctx._locals.logger.enabled) {
            Api.log.error(err.message);
        }

        ctx.body = payload;
    }
};
