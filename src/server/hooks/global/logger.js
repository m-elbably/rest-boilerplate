const _ = require('lodash');
const pino = require('pino');

const logLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'];

const formatters = {
    bindings(bindings) {
        return { pid: bindings.pid };
    }
};

// pretty.pipe(process.stdout);
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    timestamp: true,
    formatters,
    prettyPrint: {
        levelFirst: false,
        translateTime: true // TODO - Only in development
    }
});

module.exports = logger;
