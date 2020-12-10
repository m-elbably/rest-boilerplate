const { MongoClient } = require('mongodb');
const { UnexpectedError } = require('../../../common/errors');

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
                const promises = indexes
                    .map((index) => this._db.collection(model.name).createIndex(index.fields, index.options));
                await Promise.all(promises);
            }
        }
    }

    async _postConnection() {
        const promises = Object.values(this._models)
            .map((model) => {
                model.database = this._db;
                return this._applyModelOptions({ ...model, database: this._db });
            });
        await Promise.all(promises);
    }

    async registerModel(model) {
        this._models[model.name] = model;
        if (this.isConnected()) {
            await this._applyModelOptions({ ...model, database: this._db });
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
            await this._postConnection();
            return this;
        } catch (err) {
            if (this._retries >= DB_RETRIES) {
                console.log('Connection timeout');
                throw err;
            }

            this._retries += 1;
            return new Promise((resolve) => {
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

    get instance() {
        return this._db;
    }

    async close() {
        if (this._client) {
            return this._client.close();
        }
        return null;
    }
}

module.exports = Database;
