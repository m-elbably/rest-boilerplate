const koaBody = require('koa-body');
const compress = require('koa-compress');
const cors = require('@koa/cors');

// Routes
const routes = require('./routes');

// Request middlewares
const { logger } = require('./request');
const requestInterceptors = require('./request/interceptors');
// Response middlewares
const { error, notFound } = require('./response');
const responseInterceptors = require('./response/interceptors');

const authentication = require('./authentication');

const middlewares = [
    error(),
    compress(),
    responseInterceptors(),
    logger({ enabled: true }),
    cors(),
    koaBody(),
    requestInterceptors(),
    authentication(),
    routes(),
    notFound(),
];

module.exports = middlewares;
