const contextHooks = require('./context');
const globalHooks = require('./global');

const hooks = [];
// Context hooks
contextHooks.forEach((entry) => {
    hooks.push({
        type: 'context',
        hook: entry
    });
});
// Global hooks
globalHooks.forEach((entry) => {
    hooks.push({
        type: 'global',
        hook: entry
    });
});

module.exports = hooks;
