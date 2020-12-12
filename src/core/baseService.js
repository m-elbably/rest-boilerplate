const _ = require('lodash');
const { ObjectId } = require('mongodb');
const { NotFoundError, ValidationError } = require('../common/errors');
const { common: { pageSize } } = require('../config');

class BaseService {
    constructor(model) {
        this.ObjectId = ObjectId;
        this._model = model;
    }

    /**
     * Parse opts into params & options
     * params: Non mongodb params passed to service
     * {
     *     paginate: boolean, [true]
     *     validate: boolean, [true]
     *     page: number,
     *     limit: number,
     *     sort: {
     *         field: 0 || 1
     *     },
     *     fields: {
     *         field: 0 || 1
     *     },
     *     populate:
     *     [{
     *        field: path,
     *        collection: String
     *     }]
     * }
     * options: mongodb compatible options attributes
     * {
     *      sort: object,
     *      projection: object
     * }
     * @param opts: object [All options]
     * @param multiple: boolean [multiple documents]
     * @returns {*}
     * @private
     */
    // eslint-disable-next-line class-methods-use-this
    _parseOptions(opts, multiple = false) {
        const qOptions = _.get(opts, 'options', {});
        const {
            validate, page, limit, projection, sort, populate
        } = qOptions;

        const options = {};
        const params = {
            validate: _.isNil(validate) ? true : validate
        };

        if (!_.isNil(page) && multiple) {
            params.page = page;
        }

        if (populate) {
            params.populate = populate;
        }

        // Options
        if (multiple) {
            options.limit = pageSize;
        }

        if (!_.isNil(limit) && multiple) {
            options.limit = limit;
        }
        if (!_.isNil(sort) && multiple) {
            options.sort = sort;
        }
        if (!_.isNil(projection)) {
            options.projection = projection;
        }

        return { params, options };
    }

    async create(document) {
        return this._model.create(document)
            .then((result) => result.toJSON());
    }

    async updateById(id, update, opts = {}) {
        const nQuery = {
            $set: update
        };
        const nOptions = _.merge(opts, {
            returnOriginal: false
        });

        return this._model.updateById(id, nQuery, nOptions)
            .then((result) => {
                if (_.isNil(result)) {
                    throw new NotFoundError();
                }

                return result.toJSON();
            });
    }

    async updateOne(filter, update, opts = {}) {
        const nQuery = {
            $set: update
        };
        const nOptions = _.merge(opts, {
            returnOriginal: false
        });

        return this._model.updateOne(filter, nQuery, nOptions)
            .then((result) => {
                if (_.isNil(result)) {
                    throw new NotFoundError();
                }

                return result.toJSON();
            });
    }

    async findById(id, opts = {}) {
        const { params, options } = this._parseOptions(opts);
        return this._model.findById(id, options)
            .then((result) => {
                if (_.isNil(result) && params.validate) throw new NotFoundError();
                return result;
            }).then((result) => {
                if (params.populate) {
                    result.populate(params.populate);
                }
                return result.toJSON();
            });
    }

    async findOne(filter = {}, opts = {}) {
        const { params, options } = this._parseOptions(opts);
        return this._model.findOne(filter, options)
            .then((result) => {
                if (_.isNil(result) && params.validate) throw new NotFoundError();
                return result;
            }).then((result) => {
                if (params.populate) {
                    result.populate(params.populate);
                }
                return result.toJSON();
            });
    }

    async find(filter = {}, opts = {}, modelName) {
        const { params, options } = this._parseOptions(opts, true);
        const collectionName = modelName || this._model.name;
        const result = {
            [collectionName]: [],
            page: 0,
            pages: 0,
            count: 0,
            _i: { // Internal object to be used for filtering data
                dataPath: collectionName // Documents path in object
            }
        };

        const { limit } = options;
        const { page, populate } = params;
        const count = await this._model.count(filter);

        const pages = Math.ceil(count / limit);
        const pIndex = page > 0 ? page - 1 : 0;

        options.limit = limit;
        options.skip = limit * pIndex;

        result.count = count;
        result.pages = pages;
        result.page = pages === 0 ? 0 : page;

        const query = await this._model.find(filter, options);
        return query.toArray()
            .then((docs) => {
                if (params.populate) {
                    const promises = docs.map((doc) => doc.populate(populate));
                    return Promise.all(promises);
                }

                return docs;
            }).then((docs) => docs.map((doc) => doc.toJSON()))
            .then((docs) => {
                result[collectionName] = docs;
                return result;
            });
    }

    async deleteOne(filter, opts = {}) {
        return this._model.deleteOne(filter, opts)
            .then((result) => {
                if (_.isNil(result)) {
                    throw new NotFoundError();
                }

                return result.toJSON();
            });
    }

    async deleteById(id, opts = {}) {
        return this._model.deleteById(id, opts)
            .then((result) => {
                if (_.isNil(result)) {
                    throw new NotFoundError();
                }

                return result.toJSON();
            });
    }

    async exists(filter) {
        return this._model.exists(filter);
    }

    async aggregate(pipeline, options) {
        return this._model.aggregate(pipeline, options);
    }

    // eslint-disable-next-line class-methods-use-this
    get utcTimestamp() {
        return new Date(Date.now());
    }
}

module.exports = BaseService;
