var IQHN = IQHN || {};

/**
 * 
 * Wrapper around the raw data-object from the storage.
 * 
 */



IQHN.DbQueryObj = function (data) {

    //For avoiding to join the 'query' array at every compare
    this.query_str_ = null;

    this.data_ = null;
    if (data)
        this.setData(data);

    this.duplicate_ = false;

    this.recs_ = [];
};

/**
 * Set Data coming from @see{IQHN.DbHandlerIndexedDb.getStorageData_}
 * @param {type} data Obj
 */
IQHN.DbQueryObj.prototype.setData = function (data) {
    this.data_ = data;

    var words = [];
    for (var str_c = 0; str_c < data.query.length; str_c++) {
        words.push(data.query[str_c]["text"]);
    }
    this.query_str_ = words.join(" ");
};

/**
 * Returning (processed) data originally from @see{IQHN.DbHandlerIndexedDb.getStorageData_}.
 * @returns {object}
 */
IQHN.DbQueryObj.prototype.getData = function () {
    return this.data_;
};

/**
 * Returns the timestamp from the db data
 * @returns {float} timestamp
 */
IQHN.DbQueryObj.prototype.getTimestamp = function () {
    return this.data_.timestamp;
};

/**
 * 
 * @param {type} rec_data IQHN.DbRecObj.data_
 * @returns {IQHN.DbQueryObj.data_.timestamp}
 */
IQHN.DbQueryObj.prototype.addRec = function (rec_data) {
    this.recs_.push(rec_data);
};

/**
 * Returning array of rec-data @see{IQHN.DbRecObj}
 * @returns {Array}
 */
IQHN.DbQueryObj.prototype.getRecs = function () {
    return this.recs_;
};

/**
 * Flag this query data as an duplicate
 */
IQHN.DbQueryObj.prototype.flagDuplicate = function () {
    this.duplicate_ = true;
};

/**
 * Returns true if query-search is an duplicate of another one
 * @returns {Boolean}
 */
IQHN.DbQueryObj.prototype.getIsDuplicate = function () {
    return(this.duplicate_);
};

/**
 * Returns the search string
 * @returns {string}
 */
IQHN.DbQueryObj.prototype.getQueryStr = function () {
    return this.query_str_;
};





/**
 * Create DbQueryObj Array holding the db-data
 * @param {type} data
 * @returns {Array}
 */
IQHN.DbQueryObj.createObjectsFromDbData = function (data) {

    var objects_ = [];

    for (var i = 0; i < data.length; i++)
        objects_.push(new IQHN.DbQueryObj(data[i]));
    return objects_;
};



