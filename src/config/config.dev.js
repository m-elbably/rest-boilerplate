const API_NAME = 'MY_API';

module.exports = {
    api: {
        name: API_NAME,
        version: '1.0',
        host: 'localhost',
        port: process.env.PORT || 8080,

        contextStoreName: 'api'
    },
    common: {
        pageSize: 10,
        maxPageSize: 100,
    },
    locales: {
        dataPath: `${__dirname}/locales`,
        dataExtension: '.json',
        supportedLocales: ['en', 'ar', '_']
    },
    authentication: {
        issuer: 'website.com',
        key: 'JWT_SECRET_HERE',
        expiration: 604800, // 7 Days
    },
    mongo: {
        host: 'localhost',
        port: 27017,
        name: API_NAME,
    }
};
