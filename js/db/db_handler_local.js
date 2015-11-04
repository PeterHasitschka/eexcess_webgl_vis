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
    for (var i = 0; i < db_results.length; i++) {

        var curr_item = db_results[i];
        var query = curr_item.query;

        //Prevent duplicate collections if flag is set.
        if (!this.get_duplicates_ && queries_used.indexOf(query) >= 0)
            continue;
        queries_used.push(query);

        var res_id = curr_item.id;


        var eexcess_data = {
            query: this.enrichQuery(query),
            id: res_id,
            timestamp: 000000
        };

        var collection = new GLVIS.Collection(eexcess_data);


        for (var j = 0; j < curr_item.result.length; j++) {

            var curr_res_data = curr_item.result[j];

            var res_eexcess_data = {
                result: curr_res_data
            };

            var rec = new GLVIS.Recommendation(res_eexcess_data, collection);
            
            //Add relevance. The first has the highest
            rec.setRelevance(1 - (j / curr_item.result.length));
            
            collection.addRecommendation(rec);
        }


        console.log(collection);
        collections.push(collection);
    }





    return collections;

};


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