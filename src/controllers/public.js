const BaseController = require('../core/baseController');

class Public extends BaseController {
  constructor() {
    super({
      name: 'root',
      path: '/',
      routes: [
        { method: 'GET', path: '/', handler: Public.main },
        { method: 'GET', path: 'live', handler: Public.live },
        // { method: 'GET', path: 'ready', handler: 'ready' },
      ],
    });
  }

  static async main(ctx) {
    ctx.body = { message: 'API' };
  }

  static async live(ctx) {
    ctx.body = { message: 'API' };
  }
  //
  // async ready(ctx) {
  //   ctx.body = { message: 'API' };
  // }
}

module.exports = Public;
