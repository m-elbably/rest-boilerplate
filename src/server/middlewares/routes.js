const Router = require('koa-router');

const Multipart = require('./request/multipart');
const { ValidationError } = require('../../common/errors');

const controllers = require('../../controllers');

function buildControllerRouter(controller) {
  const router = new Router();
  const ctrlPath = controller.path;
  const ctrlRoutes = controller.routes;
  const { beforeAction, afterAction } = controller.constructor.prototype;

  ctrlRoutes.forEach((route) => {
    const {
      method, path, handler, multipart,
    } = route;

    if (!router.methods.includes(method)) {
      throw new ValidationError(`Method ${method} is not supported`);
    }

    const routerArgs = [
      path,
      afterAction.bind(controller),
      beforeAction.bind(controller),
      handler,
    ];

    if (multipart) {
      const multipartParser = new Multipart(multipart);
      routerArgs.splice(routerArgs.length - 1, 0, multipartParser);
    }

    router[method.toLowerCase()](...routerArgs);
  });

  return [ctrlPath, router.routes()];
}

module.exports = () => {
  const routes = [];
  const router = new Router();

  controllers.forEach((Controller) => {
    const ctrlInstance = new Controller();
    const ctrlRoute = buildControllerRouter(ctrlInstance);
    routes.push(ctrlRoute);
  });

  routes.forEach((route) => {
    router.use(...route);
  });

  router.allowedMethods();
  return router.routes();
};
