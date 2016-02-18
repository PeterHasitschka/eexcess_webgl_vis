var IQHN = IQHN || {};

/**
 * 
 * @param {Array[string} bms    Array holding the bookmark-names. Rest of the data gets loaded via local-storage
 */
IQHN.BookmarkHandler = function (bms) {

    this.bms_ = bms;
};
/**
 * Build collections with the help of the bookmark-names stored in this.bms_
 * and the stored bookmark-collection in local storage, where the full result-
 * objects are accessible.
 * @return [IQHN.Collection]
 */
IQHN.BookmarkHandler.prototype.getCollections = function () {
    var colls = [];

    //Load the stored bookmarks from localstorage
    var stored_bms = localStorage.getItem('bookmark-dictionary');
    if (!stored_bms) {
        console.error("Could not find any bookmarks in local storage!");
        return [];
    }
    stored_bms = JSON.parse(stored_bms);

    //Go through the collection-names
    var last_coll = null;
    for (var b_idx = 0; b_idx < this.bms_.length; b_idx++) {

        var bm_key = this.bms_[b_idx];

        var eexcess_data = {
            query: [{text: bm_key, weight: 1}],
            id: b_idx,
            timestamp: 000000
        };
        var coll = new IQHN.Collection(eexcess_data);

        //Search in (enriched) local-Storage data for this bookmark-collection to get full results.
        var curr_stored_bm = stored_bms[bm_key];
        if (!curr_stored_bm) {
            console.error("Could not find bookmark-collection '" + bm_key + "' in local storage!");
            continue;
        }

        for (var item_idx = 0; item_idx < curr_stored_bm.items.length; item_idx++) {
            var curr_item = stored_bms[bm_key].items[item_idx];

            var res_eexcess_data = {
                result: curr_item
            };

            var rec = new IQHN.Recommendation(res_eexcess_data, coll);
            rec.setRelevance(1);

            coll.addRecommendation(rec);
        }

        if (last_coll)
            coll.setParentId(last_coll.getId());
        colls.push(coll);
        last_coll = coll;
    }
    return colls;
};