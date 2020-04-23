const SERVICE_NAME = 'SERVICE_NAME_HERE';

module.exports = {
  service: {
    name: SERVICE_NAME,
    version: '1.0',
    host: 'localhost',
    port: process.env.PORT || 8080,
  },
  authentication: {
    issuer: 'website.com',
    key: 'JWT_SECRET_HERE',
    expiration: 604800, // 7 Days
  },
  mongo: {
    host: 'MONGO_DB_CONNECTION',
    port: 27017,
    name: SERVICE_NAME,
  }
};
