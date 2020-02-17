module.exports = async (ctx, next) => {
    try {
        if (ctx.request.method === 'POST' || ctx.request.method === 'PUT') {
            if (ctx.request.headers['content-type']
                && ctx.request.headers['content-type'].indexOf('multipart/form-data') >= 0
                && ctx.request.body && ctx.request.body.data) {
                ctx.request.body = JSON.parse(ctx.request.body.data);
            }
        }

        await next();
    } catch (err) {
        throw err;
    }
};
