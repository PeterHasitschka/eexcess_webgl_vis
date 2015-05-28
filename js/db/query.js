var GLVIS = GLVIS || {};

/**
 * 
 * Wrapper around the raw data-object from the storage.
 * 
 */



GLVIS.DbQueryObj = function (data) {

    this.data_ = null;
    if (data)
        this.data_ = data;
};

/**
 * Set Data coming from @see{GLVIS.DbHandler.getStorageData_}
 * @param {type} data Obj
 */
GLVIS.DbQueryObj.prototype.setData = function (data) {
    this.data_ = data;
};

/**
 * Returning (processed) data originally from @see{GLVIS.DbHandler.getStorageData_}.
 * @returns {object}
 */
GLVIS.DbQueryObj.prototype.getData = function () {
    return this.data_;
};


GLVIS.DbQueryObj.createObjectsFromDbData = function (data) {

    var objects_ = [];

    for (var i = 0; i < data.length; i++)
        objects_.push(new GLVIS.DbQueryObj(data[i]));


    return objects_;
};