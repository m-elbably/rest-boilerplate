const _ = require('lodash');
const ObjectId = require('mongodb').ObjectID;
/**
 * Options: {
 *   timestamp: boolean,
 *   indexes: [ {email: 1}]
 * }
 */
class Model {
    constructor(name, options) {
        this._name = name.toLowerCase();
        this._db = null;

        this._model = null;
        this._options = options || {};
    }

    preSave(data) {
        const cData = { ...data };
        if (this._options.timestamp) {
            cData.createdAt = new Date(Date.now());
            cData.updatedAt = new Date(Date.now());
        }
        return cData;
    }

    preUpdate(update) {
        const cUpdate = { ...update };

        if (this._options.timestamp) {
            if (_.isNil(update.$set)) {
                cUpdate.$set = {};
            }

            cUpdate.$set.updatedAt = new Date(Date.now());
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
            document = this.preSave(data);
        }

        return this._model.insertOne(document)
            .then((res) => (res.insertedCount > 0 ? res.ops[0] : null));
    }

    async updateById(id, update, options = {}) {
        let cUpdate = { ...update };
        if (this.preUpdate) {
            cUpdate = this.preUpdate(update);
        }

        return this._model.findOneAndUpdate({ _id: new ObjectId(id) }, cUpdate, options)
            .then((res) => res.value);
    }

    async updateOne(filter, update, options = {}) {
        let cUpdate = { ...update };
        if (this.preUpdate) {
            cUpdate = this.preUpdate(update);
        }

        return this._model.findOneAndUpdate(filter, cUpdate, options)
            .then((res) => res.value);
    }

    async find(filter = {}, options = {}) {
        return this._model.find(filter, options);
    }

    async findOne(filter, options = {}) {
        return this._model.findOne(filter, options);
    }

    async findById(id, options = {}) {
        return this._model.findOne({ _id: new ObjectId(id) }, options);
    }

    async deleteOne(filter, options = {}) {
        return this._model.findOneAndDelete(filter, options)
            .then((res) => res.value);
    }

    async deleteById(id, options = {}) {
        return this._model.findOneAndDelete({ _id: new ObjectId(id) }, options)
            .then((res) => res.value);
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
