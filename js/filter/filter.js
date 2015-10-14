var GLVIS = GLVIS || {};

/**
 * A Filter to be applied to the scene's collections
 * @param {string} key @see{GLVIS.Filter.KEYS}
 * @param {string} value
 */
GLVIS.Filter = function (key, value) {

    if (typeof key !== 'object')
        throw ("Key must be an object!");

    this.key_ = key;
    this.value_ = value;
};


GLVIS.Filter.prototype.getKey = function () {
    return this.key_;
};
GLVIS.Filter.prototype.getValue = function () {
    return this.value_;
};





GLVIS.Filter.KEYS = {
    LANG: {
        identifier: "language",
        type: "eexcess"
    },
    PROVIDER: {
        identifier: "provider",
        type: "eexcess"
    }

};