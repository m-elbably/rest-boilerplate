const { MongoClient } = require('mongodb');
const { UnexpectedError } = require('../../../core/common/errors');

const DB_RETRIES = 30;
const DB_WAIT_TIME = 2000;

class Database {
  constructor(config) {
    const params = config || {};
    this._host = params.host || 'localhost';
    this._port = params.port || 27017;
    this._name = params.name || 'test';
    this._options = params.options || {};

    this._models = {};
    this._client = null;
    this._db = null;
    this._retries = 0;

    this._applyModels(config.models);

    this._uri = `mongodb://${this._host}:${this._port}`;
    if (this._host.startsWith('mongodb')) {
      this._uri = this._host;
    }

    this._client = new MongoClient(this._uri, this._options);
  }

  async _collectionExists(name) {
    if (!this.isConnected()) {
      return [];
    }

    try {
      const colls = await this._db.listCollections().toArray();
      for (let i = 0; i < colls.length; i += 1) {
        if (colls[i].name.toLowerCase() === name.toLowerCase()) {
          return true;
        }
      }

      return false;
    } catch (err) {
      throw new UnexpectedError(err);
    }
  }

  _applyModels(models) {
    if (!models || models.length === 0) {
      console.log('No models associated with database');
      return;
    }

    for (let i = 0; i < models.length; i += 1) {
      this._models[models[i].name] = models[i];
    }
  }

  async _applyModelOptions(model) {
    if (!model || !model.options) {
      return;
    }

    const { indexes } = model.options;
    if (indexes && indexes.length > 0) {
      const collExists = await this._collectionExists(model.name);
      if (!collExists) {
        for (let i = 0; i < indexes.length; i += 1) {
          const options = indexes[i].options || {};
          await this._db.collection(model.name).createIndex(indexes[i].fields, options);
        }
      }
    }
  }

  async _postConnection() {
    for (const key in this._models) {
      const model = this._models[key];
      model.database = this._db;
      await this._applyModelOptions(model);
    }
  }

  async registerModel(model) {
    this._models[model.name] = model;
    if (this.isConnected()) {
      model.database = this._db;
      await this._applyModelOptions(model);
    }

    return model;
  }

  async connect() {
    try {
      await new Promise((resolve, reject) => {
        this._client.connect()
          .then(() => resolve(),
            (err) => reject(err));
      });

      console.log('Connected to [Mongo DB]');
      this._db = this._client.db(this._name);
      return this._postConnection();
    } catch (err) {
      if (this._retries >= DB_RETRIES) {
        console.log('Connection timeout');
        throw err;
      }

      this._retries++;
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log(`Waiting for database, Retries ${this._retries}, ${err}`);
          resolve(this.connect());
        }, DB_WAIT_TIME);
      });
    }
  }

  isConnected() {
    if (!this._client) {
      return false;
    }

    return this._client.isConnected();
  }

  async close() {
    if (this._client) {
      return this._client.close();
    }
  }
}

module.exports = Database;
