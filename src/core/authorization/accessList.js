const aclResources = {
    USER: 'user'
};

const aclRoles = {
    admin: {
        [aclResources.USER]: {
            'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*'], 'delete:any': ['*']
        },
    },
    user: {
        [aclResources.USER]: { 'create:any': ['*', '!blocked', '!password'], 'read:any': ['*', '!password', '!details.code'] },
    },
    public: {
        [aclResources.USER]: { 'read:any': ['*', '!password', '!details.code'] },
    }
};

module.exports = {
    aclResources,
    aclRoles
};
