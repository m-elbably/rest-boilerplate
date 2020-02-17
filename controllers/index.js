const Router = require('koa-router');
const router = new Router();

router.get('/', async (ctx) => {
    ctx.body = {message: 'API'};
});

router.get('live', async (ctx) => {
    // Liveness check here
    ctx.status = 200;
});

router.get('ready', async (ctx) => {
    // Readiness check here
    ctx.status = 200;
});

module.exports = router;
