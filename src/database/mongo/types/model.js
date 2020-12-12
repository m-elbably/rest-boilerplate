const _ = require('lodash');
const { EJSON } = require('bson');
const { ObjectID } = require('mongodb');
const { ValidationError } = require('../../../common/errors');
/**
 * Options: {
 *   timestamp: boolean,
 *   indexes: [ {
 *       fields: 'object',
 *       options: 'object'
 *   }],
 *   unique: {
 *       fields: ['string'],
 *       ignoreCase: boolean
 *   }
 * }
 */
class Model {
    constructor(name, options) {
        this._name = name.toLowerCase();
        this._db = null;

        this._model = null;
        this._options = options || {};
        this.ObjectID = ObjectID;
    }

    /* eslint-disable no-param-reassign */
    decorate(document) {
        document.toJSON = () => {
            const documentClone = { ...document };
            delete documentClone.toJSON;
            return EJSON.deserialize(documentClone);
        };
        /**
         * Populate document
         * @param options
         * [{
         *     field: path,
         *     collection: String
         * }]
         * @returns document
         */
        document.populate = async (options) => {
            if (options == null || !Array.isArray(options)) {
                return;
            }

            for (let i = 0; i < options.length; i += 1) {
                const rId = _.get(document, options[i].field);
                if (!_.isNil(rId)) {
                    const rModel = this._db.collection(options[i].collection);
                    // eslint-disable-next-line no-await-in-loop
                    const rDocument = await rModel.findOne({ _id: new ObjectID(rId) });
                    if (!_.isNil(rDocument)) {
                        _.set(document, options[i].field, rDocument);
                    }
                }
            }
        };

        return document;
    }

    async validateUniqueness(data, ignoreId) {
        const { unique } = this._options;
        const { fields, ignoreCase } = unique;
        const options = {};
        const query = {};
        for (let i = 0; i < fields.length; i += 1) {
            query[fields[i]] = data[fields[i]];
        }

        if (ignoreCase) {
            options.collation = { locale: 'en', strength: 2 };
        }

        if (ignoreId != null) {
            query._id = { $ne: new ObjectID(ignoreId) };
        }

        const exists = await this.exists(query, options);
        if (exists) {
            throw new ValidationError(`Document with the same [${fields}] already exists`);
        }
    }

    async preSave(data) {
        const cData = { ...data };
        const { timestamp, unique } = this._options;
        if (timestamp) {
            cData.createdAt = new Date(Date.now());
            cData.updatedAt = new Date(Date.now());
        }

        if (unique) {
            await this.validateUniqueness(cData);
        }

        return cData;
    }

    async preUpdate(id, update) {
        const cUpdate = { ...update };
        const { timestamp, unique } = this._options;
        if (timestamp) {
            if (_.isNil(update.$set)) {
                cUpdate.$set = {};
            }

            cUpdate.$set.updatedAt = new Date(Date.now());
        }

        if (unique) {
            await this.validateUniqueness(cUpdate, id);
        }

        return cUpdate;
    }

    get name() {
        return this._name;
    }

    get options() {
        return this._options;
    }

    set database(db) {
        this._db = db;
        this._model = this._db.collection(this._name);
    }

    get database() {
        return this._db;
    }

    get model() {
        return this._model;
    }

    async create(data) {
        let document = data;
        if (this.preSave) {
            document = await this.preSave(data);
        }

        return this._model.insertOne(document)
            .then((res) => (res.insertedCount > 0 ? this.decorate(res.ops[0]) : null));
    }

    async updateById(id, update, options = {}) {
        let cUpdate = { ...update };
        if (this.preUpdate) {
            cUpdate = await this.preUpdate(id, update);
        }

        return this._model.findOneAndUpdate({ _id: new ObjectID(id) }, cUpdate, options)
            .then((res) => this.decorate(res.value));
    }

    async updateOne(filter, update, options = {}) {
        let cUpdate = { ...update };
        if (this.preUpdate) {
            cUpdate = await this.preUpdate(id, update);
        }

        return this._model.findOneAndUpdate(filter, cUpdate, options)
            .then((res) => this.decorate(res.value));
    }

    async find(filter = {}, options = {}) {
        return this._model.find(filter, options)
            .then((documents) => documents.map((document) => this.decorate(document)));
    }

    async findOne(filter, options = {}) {
        return this._model.findOne(filter, options)
            .then((document) => this.decorate(document));
    }

    async findById(id, options = {}) {
        return this._model.findOne({ _id: new ObjectID(id) }, options)
            .then((document) => this.decorate(document));
    }

    async deleteOne(filter, options = {}) {
        return this._model.findOneAndDelete(filter, options)
            .then((res) => this.decorate(res.value));
    }

    async deleteById(id, options = {}) {
        return this._model.findOneAndDelete({ _id: new ObjectID(id) }, options)
            .then((res) => this.decorate(res.value));
    }

    async exists(filter) {
        return this._model.findOne(filter).then((res) => !_.isNil(res));
    }

    async count(filter) {
        if (filter) {
            return this._model.countDocuments(filter);
        }
        return this._model.estimatedDocumentCount();
    }
}

module.exports = Model;
