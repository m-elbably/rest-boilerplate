const _ = require('lodash');
const utils = require('../../../../common/utils');
const { pageSize, maxPageSize } = require('../../../../config').common;

module.exports = (ctx) => {
    let page;
    let limit;
    const { query } = ctx.request;
    const parsedQuery = {
        options: {
            page: 1,
            limit: pageSize,
            projection: {},
            sort: {},
        },
        filters: {}
    };

    Object.entries(query).forEach(([key, value]) => {
        switch (key) {
        case 'page':
            page = utils.parseInt(value);
            page = page >= 1 ? page : 1;
            parsedQuery.options.page = page;
            break;
        case 'limit':
            limit = utils.parseInt(value);
            limit = limit >= maxPageSize ? maxPageSize : limit;
            parsedQuery.options.limit = limit;
            break;
        case 'projection':
            value.split(',')
                .forEach((entry) => {
                    const op = entry.startsWith('-') ? 0 : 1;
                    const field = op === 1 ? entry : entry.substr(1);
                    parsedQuery.options.projection[field] = op;
                });
            break;
        case 'sort':
            value.split(',')
                .forEach((entry) => {
                    let field = entry.trim();
                    const op = field.startsWith('-') ? -1 : 1;

                    if (!field || field.length === 0) {
                        return;
                    }

                    if (op < 0) {
                        field = field.substr(1);
                    }

                    parsedQuery.options.sort[field] = op;
                });
            break;
        default:
            parsedQuery.filters[key] = value;
            delete parsedQuery[key];
        }
    });

    _.merge(ctx.request.query, parsedQuery);
};
