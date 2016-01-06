var GLVIS = GLVIS || {};


GLVIS.DbHandlerLocalStorage = function () {

    /** @type{QueryResultDb} **/
    this.db_ = queryDb;

    if (!queryDb)
        throw("Could not find database object of visualization dashboard!");

    this.get_duplicates_ = false;

};


GLVIS.DbHandlerLocalStorage.prototype.getCollections = function () {

    var db_results = this.db_.getAllQueriesOrdered();
    var queries_used = [];
    var collections = [];

    var last_coll = null;
    for (var i = 0; i < db_results.length; i++) {

        var curr_item = db_results[i];

        if (typeof (curr_item.profile) === 'undefined') {

            console.warn("Could not interprate saved results! Skipping!", curr_item);
            continue;
        }
        var kws = curr_item.profile.contextKeywords;

        var query_str = [];
        for (var j = 0; j < kws.length; j++) {
            query_str.push(kws[j].text);
        }
        query_str = query_str.join(" ");

        //Prevent duplicate collections if flag is set.
        if (!this.get_duplicates_ && queries_used.indexOf(query_str) >= 0)
            continue;
        queries_used.push(query_str);

        var res_id = curr_item.id;

        var eexcess_data = {
            query: kws,
            id: res_id,
            timestamp: 000000
        };

        var collection = new GLVIS.Collection(eexcess_data);
        if (last_coll)
            collection.setParentId(last_coll.getId());

        var max_length = GLVIS.config.db.max_recs_to_load;
        
        var result_length = curr_item.result.length;
        
        if (max_length !== null && result_length > max_length) {
            GLVIS.Debugger.debug("DbHandlerLocalStorage", "WARNING! Limiting result count (" + 
                    result_length + ") to " + max_length, 3);
            result_length = max_length;
        }
        
        for (var j = 0; j < result_length; j++) {

            var curr_res_data = curr_item.result[j];

            var res_eexcess_data = {
                result: curr_res_data
            };

            var rec = new GLVIS.Recommendation(res_eexcess_data, collection);

            //Add relevance. The first has the highest
            rec.setRelevance(1 - (j / curr_item.result.length));

            collection.addRecommendation(rec);
        }
        collections.push(collection);

        last_coll = collection;
    }
    return collections;
};

/**
 * 
 * Not necessary anymore. Data structure the same as before
 * 
 GLVIS.DbHandlerLocalStorage.prototype.enrichQuery = function (query_string) {
 
 var query_words = query_string.split(" ");
 
 var out_array = [];
 for (var i = 0; i < query_words.length; i++) {
 out_array.push({
 weight: 1,
 text: query_words[i]
 });
 }
 
 
 return out_array;
 };
 
 */