const hooks = require('./src/server/hooks');
const middlewares = require('./src/server/middlewares');
const Server = require('./src/server');

const { mongo } = require('./src/database');
const authorization = require('./src/core/rbac');

const { api } = require('./src/config');

const instance = new Server({
    name: api.name,
    port: api.port,
    hooks,
    middlewares,
    onStart: async () => {
        await mongo.connect();
        await authorization.initialize(mongo);
    },
    onEnd: async () => {
        await mongo.close();
    }
});

instance.start();
