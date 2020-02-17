const Router = require('koa-router');
const router = new Router();

const index = require('../../../controllers/index');
const dummy = require('../../../controllers/dummy');

module.exports = () => {
    const routes = [
        ['/', index.routes()],
        ['/dummy', dummy.routes()],
    ];

    routes.forEach((route) => {
        router.use(...route);
    });

    router.allowedMethods();
    return router.routes();
};
