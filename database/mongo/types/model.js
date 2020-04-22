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
    if (this._options.timestamp) {
      data.createdAt = new Date(Date.now());
      data.updatedAt = new Date(Date.now());
    }
  }

  preUpdate(update) {
    if (this._options.timestamp) {
      if (_.isNil(update.$set)) {
        update.$set = {};
      }

      update.$set.updatedAt = new Date(Date.now());
    }
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
    if (this.preSave) {
      this.preSave(data);
    }

    return this._model.insertOne(data).then((res) => {
      if (res.insertedCount > 0) {
        return res.ops[0];
      }
    });
  }

  async updateById(id, update, options = {}) {
    if (this.preUpdate) {
      this.preUpdate(update);
    }

    return this._model.findOneAndUpdate({ _id: new ObjectId(id) }, update, options)
      .then((res) => res.value);
  }

  async updateOne(filter, update, options = {}) {
    if (this.preUpdate) {
      this.preUpdate(update);
    }

    return this._model.findOneAndUpdate(filter, update, options)
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
