const MongoDB = require('./types/database');
const { host, port, name } = require('../../config').mongo;
// Models
const models = require('./models');

class Database extends MongoDB {
    constructor() {
        super({
            host,
            port,
            name,
            options: {
                useNewUrlParser: true,
                useUnifiedTopology: true
            },
            models: Object.values(models),
        });
    }

    // listenToChanges() {
    //     const stream = this._models['orders']._model.watch();
    //     stream.on('change', (next) => {
    //         console.log(next);
    //     });
    // }
}

module.exports = new Database();
