const http = require('http');
const Koa = require('koa');
const {hooks, middlewares} = require('./koa');

class Server {
    constructor(options = {}) {
        const { name, port, onError, onStart, onClose } = options;

        this._name = name;
        this._port = port || process.env.PORT;

        this._onStart = onStart;
        this._onError = onError;
        this._onClose = onClose;

        this._app = new Koa();
        this._server = http.createServer(this._app.callback());
    }

    _setHooks(hooks = []){
        Object.keys(hooks).forEach((key) => {
            this._app.context[key] = hooks[key];
        });
    }

    _setMiddlewares(middlewares = []) {
        middlewares.forEach((mw) => {
            this._app.use(mw);
        });
    }

    async start() {
        if(this._onError) {
            this._app.on('error', this._onError);
        }

        if(this._onStart) {
            await this._onStart(this._app);
        }

        // apply hooks, middlewares
        this._setHooks(hooks);
        this._setMiddlewares(middlewares);

        await new Promise((resolve, reject) => {
            this._server.on('error', (err) => {
                if (err.syscall !== 'listen') {
                    return reject(err);
                }

                switch (err.code) {
                    case 'EACCES':
                        console.error(`port ${err.port} requires elevated privileges`);
                        process.exit(1);
                        break;
                    case 'EADDRINUSE':
                        console.error(`port ${err.port} is already in use`);
                        process.exit(1);
                        break;
                    default:
                        if(this._onError) {
                            this._onError(err);
                        }
                        reject(err);
                }
            });

            this._server.on('listening', () => {
                resolve();
            });

            this._server.listen(this._port);
        });

        const info = this._server.address();
        const port = info.port;
        const host = (info.address === '::') ? 'localhost' : info.address;
        const env = process.env.NODE_ENV || 'development';

        console.log(`Service [${this._name}] started at ${host}:${port} on ${env}`);
    }

    async stop() {
        if(this._onClose) {
            await this._onClose();
        }

        if (this._server && this._server.listening) {
            this._server.close();
        }
    }
}

module.exports = Server;
