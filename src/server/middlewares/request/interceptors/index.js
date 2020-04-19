const headerParser = require('./headerParser');
const queryParser = require('./queryParser');
const mongoSanitizer = require('./mongoSanitizer');

module.exports = () => async (ctx, next) => {
    headerParser(ctx);
    queryParser(ctx);
    mongoSanitizer(ctx);

    await next();
};
