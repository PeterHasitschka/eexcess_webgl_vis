var GLVIS = GLVIS || {};

/**
 * A Filter to be applied to the scene's collections
 * @param {string} key @see{GLVIS.Filter.KEYS}
 * @param {string} value
 */
GLVIS.Filter = function (key, value) {

    if (typeof key === 'string') {
        for (var k in GLVIS.Filter.KEYS) {

            if (GLVIS.Filter.KEYS[k].identifier === key) {
                key = GLVIS.Filter.KEYS[k];
                break;
            }
        }
        if (typeof key !== 'object')
            throw ("Could not find key '" + key + "'");
    }

    this.key_ = key;
    this.value_ = String(value);
};


GLVIS.Filter.prototype.getKey = function () {
    return this.key_;
};
GLVIS.Filter.prototype.getValue = function () {
    return this.value_;
};


/**
 * Returns if a filter with a specific key is allowed
 * @param {string} key
 * @returns {bool} true if filter possible else false
 */
GLVIS.Filter.isFilter = function (key) {

    for (var i in GLVIS.Filter.KEYS) {
        if (GLVIS.Filter.KEYS[i].identifier === key) {
            return true;
        }
    }
    return false;
};


GLVIS.Filter.KEYS = {
    LANG: {
        identifier: "language",
        type: "eexcess"
    },
    PROVIDER: {
        identifier: "provider",
        type: "eexcess"
    },
    YEAR: {
        identifier: "year",
        type: "eexcess"
    },
    TYPE: {
        identifier: "type",
        type: "eexcess"
    },
    LICENSE: {
        identifier: "license",
        type: "eexcess"
    }
};