const _ = require('lodash');

const PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

// Mongodb request body sanitizer
const sanitizeMongoData = (body) => {
    if (body instanceof Object) {
        for (let key in body) {
            if (/^\$/.test(key)) {
                delete body[key];
            } else {
                sanitizeMongoData(body[key]);
            }
        }
    }

    return body;
};

const transformQuery = (query = {}) => {
    try {
        let buffer;
        for (let key in query) {
            const value = query[key];
            switch (key) {
                case 'paginate':
                    query.paginate = value;
                    break;
                case 'page':
                    buffer = parseInt(value || 1, 10);
                    query.page = buffer >= 1 ? buffer : 1;
                    break;
                case 'limit':
                    buffer = parseInt(value || 0, 10);
                    query.limit = (buffer > MAX_PAGE_SIZE) ? MAX_PAGE_SIZE : buffer;
                    break;
                case 'projection':
                    query.projection = {};
                    value.split(',')
                        .map((field) => {
                            const op = field.startsWith('-') ? 0 : 1;
                            const fieldName = op === 1 ? field : field.substr(1);
                            query.projection[fieldName] = op;
                        });
                    break;
                case 'sort':
                    query.sort = {};
                    value.split(',')
                        .forEach((item) => {
                            let field = item.trim();
                            const op = field.startsWith('-') ? -1 : 1;

                            if (!field || field.length === 0) {
                                return;
                            }

                            if (op < 0) {
                                field = field.substr(1);
                            }

                            query.sort[field] = op;
                        });
                    break;
                default:
                    query[key] = value;
            }
        }

        query.paginate = _.isNil(query.paginate) ? true : query.paginate;
        query.page = _.isNil(query.page) ? 1 : query.page;
        query.limit = _.isNil(query.limit) || query.limit === 0 ? PAGE_SIZE : query.limit;
    } catch (err) {
        throw err;
    }
}

module.exports = () => async (ctx, next) => {
    try {
        // Transform query
        transformQuery(ctx.request.query);
        // Sanitize mongodb inputs
        sanitizeMongoData(ctx.request.body);

        await next();
    } catch (err) {
        throw err;
    }
};

