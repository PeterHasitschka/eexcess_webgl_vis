var IQHN = IQHN || {};

/**
 * A Filter to be applied to the scene's collections
 * @param {string} key @see{IQHN.Filter.KEYS}
 * @param {string} value
 */
IQHN.Filter = function (key, value) {

    if (typeof key === 'string') {
        for (var k in IQHN.Filter.KEYS) {

            if (IQHN.Filter.KEYS[k].identifier === key) {
                key = IQHN.Filter.KEYS[k];
                break;
            }
        }
        if (typeof key !== 'object')
            throw ("Could not find key '" + key + "'");
    }

    this.key_ = key;
    this.value_ = String(value);
};


IQHN.Filter.prototype.getKey = function () {
    return this.key_;
};
IQHN.Filter.prototype.getValue = function () {
    return this.value_;
};


/**
 * Returns if a filter with a specific key is allowed
 * @param {string} key
 * @returns {bool} true if filter possible else false
 */
IQHN.Filter.isFilter = function (key) {

    for (var i in IQHN.Filter.KEYS) {
        if (IQHN.Filter.KEYS[i].identifier === key) {
            return true;
        }
    }
    return false;
};


IQHN.Filter.KEYS = {
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