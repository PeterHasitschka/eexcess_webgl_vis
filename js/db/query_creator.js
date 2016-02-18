
var IQHN = IQHN || {};


IQHN.DbQueryCreator = function (query_data) {
    this.query_data_ = query_data;
};


IQHN.DbQueryCreator.prototype.createQueries = function (end_index, length, load_duplicates) {

    IQHN.Debugger.debug("DbQueryCreator",
            "Creating " + length + " queries until index " + end_index,
            3);

    if (end_index > this.query_data_.length - 1)
        throw ("Index out of bounds!");

    var collections = [];

    var selected_query_datas = [];
    for (var back_count = end_index; back_count >= 0; back_count--) {

        if (selected_query_datas.length >= length)
            break;

        /** @type{IQHN.DbQueryObj} **/
        var curr_query_data = this.query_data_[back_count];

        //If no duplicates wanted and is duplicate, continue
        if (curr_query_data.getIsDuplicate() && !load_duplicates)
            continue;

        //If settings forbid empty queries, skip if no recs
        if (IQHN.config.scene.skip_empty_queries) {
            if (!curr_query_data.getRecs().length) {

                IQHN.Debugger.debug("DbQueryCreator",
                        "Skipping empty query while loading from db data",
                        5);

                continue;
            }
        }

        selected_query_datas.push(curr_query_data);
    }

    //Turn array around. Before creating collections due to increment ids
    selected_query_datas.reverse();

    //Used for setting parents
    var last_id = null;

    for (var q_count = 0; q_count < selected_query_datas.length; q_count++) {
        var curr_query_data = selected_query_datas[q_count];
        var collection = this.createCollection(curr_query_data);

        collection.setParentId(last_id);
        last_id = collection.getId();
        collections.push(collection);
    }

    return collections;
};

/**
 * Creates a query from the db-data
 * @param {IQHN.DbQueryObj} query_data_obj
 * @returns {IQHN.Collection}
 */
IQHN.DbQueryCreator.prototype.createCollection = function (query_data_obj) {

    var collection = new IQHN.Collection(query_data_obj.getData());
    var rec_data_array = query_data_obj.getRecs();

    for (var r_count = 0; r_count < rec_data_array.length; r_count++) {
        var curr_rec_data = rec_data_array[r_count];
        var curr_rec = new IQHN.Recommendation(curr_rec_data, collection);

        //Add relevance. The first has the highest
        curr_rec.setRelevance(1 - (r_count / rec_data_array.length));
        collection.addRecommendation(curr_rec);
    }

    IQHN.Debugger.debug("DbQueryCreator",
            "Collection from query with ID " + collection.getId() + " created", 6);

    return collection;
};