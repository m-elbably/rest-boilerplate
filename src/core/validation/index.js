const Validator = require('ajv');
const { ValidationError } = require('../../common/errors');

class Validation {
    constructor() {
        this._validator = new Validator();
    }

    validate(schema, data, strict = true) {
        const nSchema = schema;

        if (!strict) {
            delete nSchema.required;
        }

        const valid = this._validator.validate(nSchema, data);
        if (!valid) {
            throw new ValidationError(null, this._validator.errors);
        }
    }
}

module.exports = new Validation();
