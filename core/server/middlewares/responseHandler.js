const _ = require('lodash');

module.exports = () => async (ctx, next) => {
    try {
        await next();
        // Transform response here
        let dataPath = null;
        const body = ctx.response.body;
        // No body or public resource with out filtering
        if(!_.isObject(body) || _.isNil(ctx._locals.resource)) {
            return;
        }

        if(!_.isNil(body.page) && !_.isNil(body.pages)) {
            dataPath = _.findKey(body, (key) => (key !== 'page' && key !== 'pages'));
        }

        ctx.response.body = ctx.filter(ctx.user, ctx._locals.resource, body, dataPath);
    } catch (err) {
        throw err;
    }
};
