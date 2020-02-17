const _ = require('lodash');
const Router = require('koa-router');

const {DummyService} = require('../services');
const {resources} = require('../core/authorization/accessList');
const {idSchema, dummySchema} = require('../core/common/validation');

const router = new Router();

router.get('/', async (ctx) => {
    try {
        await ctx.authorize(ctx.user, resources.DUMMY, ['readAny']);
        ctx.body = await DummyService.find({}, ctx.request.query);
    } catch (err) {
        throw err;
    }
});

router.get('/:id', async (ctx) => {
    try {
        await ctx.authorize(ctx.user, resources.DUMMY, ['readAny', 'readOwn'], async () => {
            const owner = await DummyService.findById(ctx.params.id);
            return (String(owner._id) === ctx.user._id);
        });

        await ctx.validate(idSchema, ctx.params);
        ctx.body = await DummyService.findById(ctx.params.id);
    } catch (err) {
        throw err;
    }
});

router.post('/', async (ctx) => {
    try {
        await ctx.authorize(ctx.user, resources.DUMMY, ['createAny']);
        await ctx.validate(dummySchema, ctx.request.body);

        const result = await DummyService.create(ctx.request.body, ctx.files);
        ctx.body = result;
    } catch (err) {
        throw err;
    }
});

router.put('/:id', async (ctx) => {
    try {
        await ctx.authorize(ctx.user, resources.DUMMY, ['updateAny', 'updateOwn'], async () => {
            const owner = await DummyService.findById(ctx.params.id);
            return (String(owner._id) === ctx.user._id);
        });
        await ctx.validate(idSchema, ctx.params);
        await ctx.validate(dummySchema, ctx.request.body, false);

        ctx.body = await DummyService.updateById(ctx.params.id, ctx.request.body, ctx.files);
    } catch (err) {
        throw err;
    }
});

router.delete('/:id', async (ctx) => {
    try {
        await ctx.authorize(ctx.user, resources.DUMMY, ['deleteAny']);
        await ctx.validate(idSchema, ctx.params);

        await DummyService.deleteById(ctx.params.id);
        ctx.status = 200;
    } catch (err) {
        throw err;
    }
});

module.exports = router;
