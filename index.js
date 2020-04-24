const Server = require('./core/server');
const { mongo } = require('./database');
const { service } = require('./config');

const instance = new Server({
  name: service.name,
  port: service.port,
  onStart: async () => {
    await mongo.connect();
  },
  onClose: async () => {
    await mongo.close();
  }
});

instance.start();
