const BaseController = require('../core/baseController');
const { userService } = require('../services');

const { idSchema, userSchema } = require('../core/validation/schemas');

const multipart = {
    fileSize: 1 * 1024 * 1024,
    fields: {
        images: { maxCount: 2, ext: ['jpg', 'png'] },
        logo: { maxCount: 1 }
    }
};

class Users extends BaseController {
    constructor() {
        super({
            name: 'user',
            path: '/users',
            service: userService,
            routes: [
                {
                    method: 'POST', path: '/', handler: 'create', multipart
                },
                { method: 'GET', path: '/:id', handler: 'findOne' },
                { method: 'GET', path: '/', handler: 'find' },
            ]
        });
    }

    async create(ctx) {
        await ctx.authorize(['createAny']);
        await ctx.validate(ctx.request.body, userSchema);

        ctx.body = await this.service.create(ctx.request.body, ctx.request.files);
    }

    async findOne(ctx) {
        await ctx.authorize(['readAny']);
        ctx.body = await this.service.findById(ctx.params.id, ctx.request.query);
    }

    async find(ctx) {
        await ctx.authorize(['readAny']);
        ctx.body = await this.service.find({}, ctx.request.query);
    }
}

module.exports = Users;
