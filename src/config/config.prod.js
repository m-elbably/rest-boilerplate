const SERVICE_NAME = 'SERVICE_NAME_HERE';

module.exports = {
    api: {
        name: SERVICE_NAME,
        version: '1.0',
        host: 'localhost',
        port: process.env.PORT || 8080,
    },
    common: {
        pageSize: 10,
        maxPageSize: 100
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
