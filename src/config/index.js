const development = require('./config.dev');
const production = require('./config.prod');

const env = process.env.NODE_ENV || 'development';

const configurations = {
    development,
    production
};

module.exports = configurations[env];
