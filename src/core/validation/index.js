const Ajv = require('ajv');
const { ValidationError } = require('../../common/errors');

class Validator {
    constructor() {
        this._ajv = new Ajv();
    }

    validate(schema, data, strict = true) {
        const nSchema = schema;

        if (!strict) {
            delete nSchema.required;
        }

        const valid = this._ajv.validate(nSchema, data);
        if (!valid) {
            throw new ValidationError(null, this._ajv.errors);
        }
    }
}

module.exports = new Validator();
