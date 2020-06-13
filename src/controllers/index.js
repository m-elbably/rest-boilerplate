const BaseController = require('../core/baseController');

class Index extends BaseController {
    constructor() {
        super({
            name: 'root',
            path: '/',
            routes: [
                { method: 'GET', path: '/', handler: 'main' },
                { method: 'GET', path: 'live', handler: 'live' },
                { method: 'GET', path: 'ready', handler: 'ready' },
            ]
        });
    }

    async main(ctx) {
        ctx.body = { message: 'API' };
    }

    async live(ctx) {
        ctx.body = { message: 'API' };
    }

    async ready(ctx) {
        ctx.body = { message: 'API' };
    }
}

module.exports = Index;
