const { roles, resources } = require('./accessList');
const AccessControl = require('accesscontrol');

module.exports = {
    roles,
    resources,
    accessType: ['createOwn', 'createAny', 'readOwn', 'readAny', 'updateOwn', 'updateAny', 'deleteOwn', 'deleteAny'],
    accessControl: new AccessControl(roles)
};
