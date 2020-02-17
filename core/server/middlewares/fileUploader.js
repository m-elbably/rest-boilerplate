const _ = require('lodash');
const multer = require('@koa/multer');
const path = require('path');

const {ValidationError} = require('../../common/errors');

const IMAGES_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif'];
const DEFAULT_SIZE = 3 * 1024 * 1024;

function buildFields(options) {
    const fields = [];

    for (let prop in options) {
        fields.push({
            name: prop,
            maxCount: options[prop].maxCount,
            ext: options[prop].ext
        });
    }

    return fields;
}

function errorHandler(err = {}, options = {}) {
    let error = err;
    const {count, size} = options;

    switch (err.code) {
        case 'LIMIT_UNEXPECTED_FILE':
            error = new ValidationError(`UPLOADER: Invalid field name or count must be less than or equal ${count} files`);
            break;
        case 'LIMIT_FILE_SIZE':
            error = new ValidationError(`UPLOADER: Files size must be equal to or less than ${options.size} bytes`);
            break;
    }

    throw error;
}

class FileUploader {
    create(options = {}) {
        return async (ctx, next) => {
            const opts = {
                size: options.size || DEFAULT_SIZE,
                fields: options.fields || { image: { maxCount: 1, ext: IMAGES_EXTENSIONS }},
            };

            function filter(req, file, next) {
                let fileExt = path.extname(file.originalname);
                const allowedExt = opts.fields[file.fieldname].ext;

                if(fileExt && fileExt.length > 0){
                    fileExt = fileExt.substr(1)
                }

                if (allowedExt && !allowedExt.includes(fileExt)) {
                    return next(new ValidationError(`UPLOADER: Invalid file extension, only [${allowedExt.toString()}] supported.`));
                }

                next(null, true);
            }

            try {
                const mConfig = {
                    storage: multer.memoryStorage(),
                    fileFilter: filter,
                    limits: {
                        fileSize: opts.size ? opts.size : DEFAULT_SIZE,
                    }
                };

                const upload = multer(mConfig).fields(buildFields(opts.fields));
                await upload(ctx, next);
            } catch (err) {
                errorHandler(err, opts);
            }
        }
    }

    get imagesExtensions() {
        return IMAGES_EXTENSIONS;
    }
}

module.exports = new FileUploader();
