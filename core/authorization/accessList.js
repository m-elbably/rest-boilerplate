const resources = {
    DUMMY: 'dummy'
};

const roles = {
    admin: {
        [resources.DUMMY]: { 'create:any': ['*'], 'read:any': ['*', '!password'], 'update:any': ['*'], 'delete:any': ['*'] },
    },
    user: {
        [resources.DUMMY]: { 'read:own': ['*', '!password'], 'update:own': ['*'] },
    },
    public: {

    }
};

module.exports = {
    resources,
    roles
};
