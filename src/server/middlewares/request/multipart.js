const _ = require('lodash');
const multer = require('@koa/multer');

const utils = require('../../../common/utils');
const { ValidationError } = require('../../../common/errors');

const NAME = 'Multipart';
const DEFAULT_FILE_SIZE = 1 * 1024 * 1024;

// TODO - support individual file size

class Multipart {
    /**
     *
     * @param config
     * {
     *     parseBody: {type: 'boolean', default: true},
     *     fileSize: {type: 'number', description: 'Max file size'},
     *     fields: {
     *         maxCount: {type: 'number'},
     *         size: {type: 'number'},
     *         ext: {type: 'array'}
     *     }
     * }
     * @returns {function(...[*]=)}
     */
    constructor(config = {}) {
        return async (ctx, next) => {
            try {
                this._options = utils.merge({
                    parseBody: true,
                    fileSize: DEFAULT_FILE_SIZE,
                    fields: {},
                }, config);

                const { parseBody, fileSize } = this._options;
                const fields = this._buildFields(this._options.fields);
                const multerConfig = {
                    storage: multer.memoryStorage(),
                    fileFilter: this.filter.bind(this),
                    limits: {
                        fileSize
                    }
                };

                const multipartParser = multer(multerConfig).fields(fields);
                await multipartParser(ctx);
                if (parseBody) {
                    this._parseBody(ctx);
                }

                await next();
            } catch (err) {
                this._errorHandler(err);
            }
        };
    }

    _buildFields(fields) {
        return Object.entries(fields).map(([key, value]) => {
            const lowerCaseExt = value && value.ext ? value.ext.map((e) => e.toLowerCase()) : [];
            _.set(fields, `${key}.ext`, lowerCaseExt);

            return {
                name: key,
                maxCount: value.maxCount,
                size: value.size,
                ext: lowerCaseExt
            };
        });
    }

    _parseBody(ctx) {
        if (ctx.request.method === 'POST' || ctx.request.method === 'PUT') {
            const contentType = _.get(ctx.request.headers, 'content-type');
            const contentTypeParts = contentType ? contentType.split(';') : [];
            if (contentType && contentTypeParts.indexOf('multipart/form-data') >= 0
                && ctx.request.body && ctx.request.body.data) {
                ctx.request.body = JSON.parse(ctx.request.body.data);
            }
        }
    }

    _getFileExtension(name) {
        const ext = '';
        if (!_.isNil(name) || name.length > 1) {
            const idx = name.lastIndexOf('.');
            if (idx >= 0) {
                return name.substr(idx + 1, name.length - idx);
            }
        }

        return ext;
    }

    filter(req, file, filterNext) {
        const fileExt = this._getFileExtension(file.originalname);
        const allowedExt = _.get(this._options.fields, `${file.fieldname}.ext`);

        if (allowedExt && !allowedExt.includes(fileExt)) {
            return filterNext(new ValidationError(`${NAME}: Invalid file type, only [${allowedExt.toString()}] supported.`));
        }

        return filterNext(null, true);
    }

    _errorHandler(err = {}) {
        let error = err;
        let fieldCount = 0;

        switch (err.code) {
        case 'LIMIT_UNEXPECTED_FILE':
            fieldCount = _.get(this._options.fields, `${err.field}.maxCount`);
            error = new ValidationError(`${NAME}: Invalid field name or count must be less than or equal ${fieldCount} file(s)`);
            break;
        case 'LIMIT_FILE_SIZE':
            error = new ValidationError(`${NAME}: Files size must be equal to or less than ${this._options.fileSize} bytes`);
            break;
        default:
        }

        throw error;
    }
}

module.exports = Multipart;
