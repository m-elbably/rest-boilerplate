const AccessControl = require('accesscontrol');
const { roles, resources } = require('./accessList');

module.exports = {
  roles,
  resources,
  accessType: ['createOwn', 'createAny', 'readOwn', 'readAny', 'updateOwn', 'updateAny', 'deleteOwn', 'deleteAny'],
  accessControl: new AccessControl(roles)
};
