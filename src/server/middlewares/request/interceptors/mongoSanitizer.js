const _ = require('lodash');

function sanitizeMongoData(body) {
    if (body instanceof Object) {
        Object.keys(body).forEach((key) => {
            if (/^\$/.test(key)) {
                _.unset(body, key);
            } else {
                sanitizeMongoData(body[key]);
            }
        });
    }
}

module.exports = (ctx) => {
    const body = _.get(ctx, 'request.body');
    sanitizeMongoData(body);
};
