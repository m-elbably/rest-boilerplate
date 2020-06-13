class Utils {
    static inDevelopment() {
        const env = process.env.NODE_ENV || 'development';
        return (env === 'development');
    }

    static isObject(obj) {
        return obj != null && obj.constructor.name === 'Object';
    }

    static parseBoolean(value) {
        return (/true/i).test(value);
    }

    static parseInt(value) {
        const parsed = parseInt(value, 10);
        return Number.isNaN(parsed) ? 0 : parsed;
    }

    /**
     * Merge destination object in src object, and ignore null props
     * @param src
     * @param dest
     * @returns {*}
     */
    static merge(src, dest) {
        if (!this.isObject(src) || !this.isObject(dest)) {
            return src;
        }

        const nSrc = src;
        Object.keys(dest).forEach((k) => {
            const ownProperty = Object.prototype.hasOwnProperty.call(dest, k);
            if (!ownProperty) {
                return;
            }

            if (dest[k] != null) {
                nSrc[k] = dest[k];
            }
        });

        return nSrc;
    }
}

module.exports = Utils;
