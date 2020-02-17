const koaBody = require('koa-body');
const compress = require('koa-compress');
const cors = require('@koa/cors');
const routes = require('../middlewares/routes');

const {
    errorHandler,
    notFoundHandler,
    responseHandler,
    authentication,
    logger,
    normalizer,
} = require('../middlewares');

const middlewares = [
    errorHandler(),
    compress(),
    responseHandler(),
    logger({autoLog: true}),
    cors(),
    koaBody(),
    normalizer(),
    authentication(),
    routes(),
    notFoundHandler(),
];

module.exports = middlewares;
