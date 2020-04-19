const _ = require('lodash');
const { EJSON } = require('bson');
const { ObjectId } = require('mongodb');
const { NotFoundError, ValidationError } = require('../common/errors');
const { pageSize, maxPageSize } = require('../config').common;

class BaseService {
    constructor(model) {
        this.ObjectId = ObjectId;
        this._model = model;
    }

    _parseDocuments(documents) {
        return _.isArray(documents) ? documents.map((doc) => EJSON.deserialize(doc))
            : EJSON.deserialize(documents);
    }

    /**
   * Populate single document
   * @param document
   * @param options
   * [{
   *     field: path,
   *     collection: String
   * }]
   * @returns document
   * @private
   */
    async _populateDocument(document, options) {
        if (_.isNil(options)) {
            return document;
        }

        for (let i = 0; i < options.length; i += 1) {
            const rId = _.get(document, options[i].field);
            if (!_.isNil(rId)) {
                const rModel = this._model.database.collection(options[i].collection);
                // eslint-disable-next-line no-await-in-loop
                const rDocument = await rModel.findOne({ _id: new ObjectId(rId) });
                if (!_.isNil(rDocument)) {
                    _.set(document, options[i].field, rDocument);
                }
            }
        }
        return document;
    }

    /**
   * Populate array of documents
   * @param documents
   * @param opts
   * [{
   *     field: path,
   *     collection: String
   * }]
   * @returns documents
   * @private
   */
    async _populate(documents, opts) {
        if (_.isNil(opts)) {
            return documents;
        }

        if (!_.isArray(documents)) {
            return this._populateDocument(documents, opts);
        }

        const promises = documents.map((document) => this._populateDocument(document, opts));
        return Promise.all(promises);
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
        const {
            paginate, validate, page, limit, projection, sort, populate
        } = opts;

        const params = {
            validate: _.isNil(validate) ? true : validate
        };
        const options = {};

        // Set defaults
        if (multiple) {
            params.paginate = true;
            options.limit = pageSize;
        }

        if (!_.isNil(paginate) && multiple) {
            params.paginate = paginate;
        }
        if (!_.isNil(page) && multiple) {
            params.page = page;
        }
        if (populate) {
            params.populate = populate;
        }

        // Options
        if (!_.isNil(sort) && multiple) {
            options.sort = sort;
        }
        if (!_.isNil(limit) && multiple) {
            options.limit = limit;
        }
        if (!_.isNil(projection)) {
            options.projection = projection;
        }

        return { params, options };
    }

    async _validateUniqueness(document, id) {
        const { unique } = this._options || {};
        if (unique) {
            const options = {};
            if (unique.ignoreCase) {
                options.collation = { locale: 'en', strength: 2 };
            }

            const query = { [unique.field]: document[unique.field] };
            if (id) {
                query._id = { $ne: this.ObjectId(id) };
            }
            const exists = await this._model.exists(query, options);
            if (exists) {
                throw new ValidationError(`Document with the same ${unique.field} already exists`);
            }
        }
    }

    async create(document) {
        return this._validateUniqueness(document)
            .then(() => this._model.create(document)).then((result) => this._parseDocuments(result));
    }

    async updateById(id, update, opts = {}) {
        const nQuery = {
            $set: update
        };
        const nOptions = _.merge(opts, {
            returnOriginal: false
        });

        await this._validateUniqueness(update, id);
        return this._model.updateById(id, nQuery, nOptions)
            .then((result) => {
                if (_.isNil(result)) {
                    throw new NotFoundError();
                }

                return this._parseDocuments(result);
            });
    }

    async updateOne(filter, update, opts = {}) {
        const nQuery = {
            $set: update
        };
        const nOptions = _.merge(opts, {
            returnOriginal: false
        });
        // FIXME: id is not defined,
        // await this._validateUniqueness(update, id);
        return this._model.updateOne(filter, nQuery, nOptions)
            .then((result) => {
                if (_.isNil(result)) {
                    throw new NotFoundError();
                }

                return this._parseDocuments(result);
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
                    return this._populate(result, params.populate);
                }
                return this._parseDocuments(result);
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
                    return this._populate(result, params.populate);
                }
                return this._parseDocuments(result);
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
        const { paginate, page, populate } = params;
        const count = await this._model.count(filter);

        if (paginate) {
            const pages = Math.ceil(count / limit);
            const pIndex = page > 0 ? page - 1 : 0;

            options.limit = limit;
            options.skip = limit * pIndex;

            result.count = count;
            result.pages = pages;
            result.page = pages === 0 ? 0 : page;
        }

        const query = await this._model.find(filter, options);
        return query.toArray()
            .then((docs) => {
                if (params.populate) {
                    return this._populate(docs, populate);
                }
                return docs;
            }).then((docs) => this._parseDocuments(docs)).then((docs) => {
                if (paginate) {
                    result[collectionName] = docs;
                    return result;
                }

                return docs;
            });
    }

    async deleteOne(filter, opts = {}) {
        return this._model.deleteOne(filter, opts)
            .then((result) => {
                if (_.isNil(result)) {
                    throw new NotFoundError();
                }

                return this._parseDocuments(result);
            });
    }

    async deleteById(id, opts = {}) {
        return this._model.deleteById(id, opts)
            .then((result) => {
                if (_.isNil(result)) {
                    throw new NotFoundError();
                }

                return this._parseDocuments(result);
            });
    }

    async exists(filter) {
        return this._model.exists(filter);
    }

    // eslint-disable-next-line class-methods-use-this
    get utcTimestamp() {
        return new Date(Date.now());
    }
}

module.exports = BaseService;
