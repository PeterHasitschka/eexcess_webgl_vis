var IQHN = IQHN || {};

/**
 * 
 * Wrapper around the raw data-object from the storage.
 * 
 */

IQHN.DbRecObj = function (data) {

    this.data_ = null;
    if (data)
        this.data_ = data;
};

/**
 * Set Data coming from @see{IQHN.DbHandlerIndexedDb.getStorageData_}
 * @param {type} data Obj
 */
IQHN.DbRecObj.prototype.setData = function (data) {
    this.data_ = data;
};

/**
 * Returning (processed) data originally from @see{IQHN.DbHandlerIndexedDb.getStorageData_}.
 * @returns {object}
 */
IQHN.DbRecObj.prototype.getData = function () {
    return this.data_;
};

/**
 * Returns the timestamp from the db data
 * @returns {float} timestamp
 */
IQHN.DbRecObj.prototype.getTimestamp = function(){
    return this.data_.timestamp;
};


IQHN.DbRecObj.createObjectsFromDbData = function (data) {

    var objects_ = [];

    for (var i = 0; i < data.length; i++)
        objects_.push(new IQHN.DbRecObj(data[i]));


    return objects_;
};