const aclResources = {
    USER: 'user',

};

module.exports = {
    admin: {
        [aclResources.USER]: {
            createAny: {
                fields: ['*'],
            },
            readOwn: {
                fields: ['*', '!blocked', '!password'],
                conditions: { _id: 'user._id' }
            }
        },
    }
};
