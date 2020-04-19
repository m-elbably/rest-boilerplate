const _ = require('lodash');
const utils = require('../../../../common/utils');

module.exports = (ctx) => {
    const { headers } = ctx;
    // Set needed local variables

    // Timezone
    const timezone = utils.parseInt(headers.timezone) || 0;
    _.set(ctx, '_locals.timezone', timezone);
    // Locale
    _.set(ctx, '_locals.locale', ctx._i18n.getLocale());
};
