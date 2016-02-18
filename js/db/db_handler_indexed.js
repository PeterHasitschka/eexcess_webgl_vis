var IQHN = IQHN || {};


IQHN.DbHandlerIndexedDb = function () {
    IQHN.DbHandlerIndexedDb.current_db_handler_ = this;

    this.db_ = null;
    this.query_data_ = [];
    this.rec_data_ = [];
};


/**
 * Creates and returns @see{IQHN.Query} objects.
 * The function is going BACKWARDS, so if 'end' is not defined or 'end' is the last index,
 * the last 'length'-elements are getting processed.
 * @param {integer} length How many objects shoud be created
 * @param {integer} end Index of the last object in list that should be created
 * @param {Boolean} load_duplicates If true, also duplicate-flagged queries are fetched
 * @returns {Array} Holding @see{IQHN.Query} objects
 */
IQHN.DbHandlerIndexedDb.prototype.fetchQueries = function (length, end, load_duplicates) {

    IQHN.Debugger.debug("DbHandlerIndexedDb",
            "Fetching " + length + " queries from query_data",
            3);
    if (!end)
        end = this.query_data_.length - 1;

    var query_creator = new IQHN.DbQueryCreator(this.query_data_);
    var queries = query_creator.createQueries(end, length, load_duplicates);
    return queries;
};


/**
 * Getting queries and recommendations from DB
 * Combining them
 * Flagging duplicates
 * @param {type} callback_ready Function called when ready
 */
IQHN.DbHandlerIndexedDb.prototype.loadQueriesAndRecs = function (callback_ready) {

    var that = this;
    this.initDb_(function () {

        IQHN.Debugger.debug("DbHandlerIndexedDb",
                "Init DB ready.",
                3);

        /**
         * Load raw query data then load raw rec data
         */
        that.getFullQueryStorageData_(function () {
            that.getFullRecStorageData_(function () {


                /**
                 * Query- and Rec- Data loaded now.
                 * Time to process them.
                 */
                //Load recs into queries
                that.injectRecDataIntoQueryData_();

                //Filter duplicate queries
                that.flagDuplicateQueryObjects_();

                IQHN.Debugger.debug("DbHandlerIndexedDb",
                        ["QUERY- AND REC-DATA", that.query_data_, that.rec_data_],
                        5);

                //Finally callback
                if (callback_ready)
                    callback_ready();
            });
        });
    });


};

IQHN.DbHandlerIndexedDb.prototype.initDb_ = function (callback_ready) {

    if (this.db_ !== null) {
        callback_ready();
        return;
    }

    var that = this;
    EEXCESS.storage.getDb(function (db) {
        that.db_ = db;  //SUCCESS
        callback_ready();
    }, function () {    //ERROR
        throw("ERROR LOADING DB");
    }
    );
};


/**
 * Flagging queries that have the same search term like another one in the db.
 * 
 * If two queries have the same search string, the OLDER one gets flagged as
 * duplicate, so newer ones appear in the list, and older ones are e.g. hidden
 */
IQHN.DbHandlerIndexedDb.prototype.flagDuplicateQueryObjects_ = function () {

    IQHN.Debugger.debug("DbHandlerIndexedDb",
            "Starting flagging duplicate query-strings",
            5);


    //Just for debug-info
    var dupl_count = 0;

    /**
     * Go backwards to avoid flagging newer objects
     */
    for (var q_count = this.query_data_.length - 1; q_count >= 0; q_count--) {

        /** @type {DbQueryObj} */
        var curr_back_q = this.query_data_[q_count];

        //If main object is already flagged, don't need to controll the rest again
        if (curr_back_q.getIsDuplicate())
            continue;

        /*
         * Inner compare-iteration that may get flagged.
         */
        for (var contr_count = 0; contr_count < this.query_data_.length; contr_count++) {

            /** @type {DbQueryObj} */
            var controll_q = this.query_data_[contr_count];

            //Don't compare to yourself!
            if (curr_back_q.getTimestamp() === controll_q.getTimestamp())
                continue;

            //If same query, flag controll-object.
            if (curr_back_q.getQueryStr() === controll_q.getQueryStr()) {
                controll_q.flagDuplicate();

                IQHN.Debugger.debug("DbHandlerIndexedDb",
                        "Flagged a query-data as duplicate",
                        8);

                dupl_count++;
            }
        }

    }

    IQHN.Debugger.debug("DbHandlerIndexedDb",
            "Finished flagging duplicate query-strings " +
            "(Flagged " + dupl_count + "/" + this.query_data_.length + ")",
            5);
};



/**
 * Load query-data from the storage and save it in @see{IQHN.DbQueryObj} objects
 * @param {type} success_cb
 * @returns {undefined}
 */
IQHN.DbHandlerIndexedDb.prototype.getFullQueryStorageData_ = function (success_cb) {

    var config = IQHN.config.db.query;
    var that = this;
    this.getStorageData_(function (data) {
        that.query_data_ = IQHN.DbQueryObj.createObjectsFromDbData(data);
        success_cb();
    },
            config.storage_name, config.fields_to_load);

};

/**
 * Load rec-data from the storage and save it in @see{IQHN.DbRecObj} objects
 * @param {type} success_cb
 * @returns {undefined}
 */
IQHN.DbHandlerIndexedDb.prototype.getFullRecStorageData_ = function (success_cb) {

    var config = IQHN.config.db.rec;
    var that = this;
    this.getStorageData_(function (data) {
        that.rec_data_ = IQHN.DbRecObj.createObjectsFromDbData(data);
        success_cb();
    },
            config.storage_name, config.fields_to_load);

};

/**
 * Fill the query-data with the data-objects of the rec-results
 * @returns {undefined}
 */
IQHN.DbHandlerIndexedDb.prototype.injectRecDataIntoQueryData_ = function () {

    for (var q_count = 0; q_count < this.query_data_.length; q_count++) {

        /** @type{IQHN.DbQueryObj} **/
        var current_query_db_obj = this.query_data_[q_count];

        for (var r_count = 0; r_count < this.rec_data_.length; r_count++) {

            /** @type{IQHN.DbRecObj} **/
            var current_rec_db_obj = this.rec_data_[r_count];

            //Maybe already unset
            if (!current_rec_db_obj)
                continue;

            /*
             * If they have the same timestamp -> Add data(!) from the rec-obj to the query-obj
             * Afterwards delete the rec-obj
             */
            if (current_query_db_obj.getTimestamp() === current_rec_db_obj.getTimestamp()) {
                current_query_db_obj.addRec(current_rec_db_obj.getData());
                delete this.rec_data_[r_count];
            }
            else
                continue;
        }
    }

    //Delete empty but long array
    this.rec_data_ = [];

    IQHN.Debugger.debug("DbHandlerIndexedDb",
            "DBHANDLER: Finished injecting recs in queries",
            3);
};



/**
 * Loading data from a db-storage and save them in an object.
 * All defined fields of theentries from the corresponding storage are getting saved.
 * 
 * @param {function} cb_query_loaded Callback function
 * @param {string} storage_name
 * @param {array} fields keys of the columns to load
 * @returns {array} holding objects of all entries of the storage with the data of the fields
 */
IQHN.DbHandlerIndexedDb.prototype.getStorageData_ = function (cb_data_loaded, storage_name, fields) {

    IQHN.Debugger.debug("DbHandlerIndexedDb",
            "GETTING DATA FROM " + storage_name,
            4);

    if (!this.db_)
        throw ("DBHANDLER: ERROR: NO DB SET!");

    var trans = this.db_.transaction(storage_name, 'readonly');
    var store = trans.objectStore(storage_name);

    var request = store.openCursor();

    var data = [];

    trans.oncomplete = function (evt) {
        cb_data_loaded(data);
    };

    request.onsuccess = function (evt) {
        var result = evt.target.result;
        ;
        var cursor = evt.target.result;

        if (cursor) {

            var data_element = {};

            for (var i = 0; i < fields.length; i++)
            {
                data_element[fields[i]] = cursor.value[fields[i]];
            }

            data.push(data_element);
            cursor.continue();
        }
    };

    request.onerror = function (evt) {
        throw ("ERROR on Request");
        ;
    };


};

/******************
 * 
 * Static functions
 * 
 ******************/


IQHN.DbHandlerIndexedDb.current_db_handler_ = null;

/**
 * Get current DB-Handler
 * @returns {IQHN.DbHandlerIndexedDb}
 */
IQHN.DbHandlerIndexedDb.getCurrentDbHandlerIndexedDb = function () {
    if (!this.current_db_handler_)
        throw("ERROR: NO CURRENT DB-HANDLER!");

    return this.current_db_handler_;
};