const _ = require('lodash');

const PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

// Mongodb request body sanitizer
const sanitizeMongoData = (body) => {
  if (body instanceof Object) {
    Object.keys(body).forEach((key) => {
      if (/^\$/.test(key)) {
        // eslint-disable-next-line no-param-reassign
        delete body[key];
      } else {
        sanitizeMongoData(body[key]);
      }
    });
  }

  return body;
};

const transformQuery = (query = {}) => {
  let buffer;
  const processedQuery = { filter: {}, params: {} };
  Object.entries(query).forEach(([key, value]) => {
    switch (key) {
      case 'paginate':
        processedQuery.params.paginate = value;
        break;
      case 'page':
        buffer = parseInt(`${value} || 1`, 10);
        processedQuery.params.page = buffer >= 1 ? buffer : 1;
        break;
      case 'limit':
        buffer = parseInt(`${value} || 0`, 10);
        processedQuery.params.limit = (buffer > MAX_PAGE_SIZE) ? MAX_PAGE_SIZE : buffer;
        break;
      case 'projection':
        processedQuery.params.projection = {};
        value.split(',')
          .forEach((field) => {
            const op = field.startsWith('-') ? 0 : 1;
            const fieldName = op === 1 ? field : field.substr(1);
            processedQuery.params.projection[fieldName] = op;
          });
        break;
      case 'sort':
        processedQuery.params.sort = {};
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

            processedQuery.params.sort[field] = op;
          });
        break;
      default:
        processedQuery.filter[key] = value;
    }
  });

  processedQuery.params.paginate = _.isNil(query.paginate) ? true : query.paginate;
  processedQuery.params.page = _.isNil(query.page) ? 1 : query.page;
  processedQuery.params.limit = _.isNil(query.limit) || query.limit === 0 ? PAGE_SIZE : query.limit;
};

module.exports = () => async (ctx, next) => {
  // Transform query
  ctx.request.query = transformQuery(ctx.request.query);
  // Sanitize mongodb inputs
  sanitizeMongoData(ctx.request.body);

  await next();
};
