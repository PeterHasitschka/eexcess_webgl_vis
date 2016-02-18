var GLIVS = IQHN || {};



IQHN.DirectCompare = function () {

    IQHN.Debugger.debug("DirectCompare", "Created Direct-Comparer", 5);

};



IQHN.DirectCompare.prototype.activate = function () {

    IQHN.Debugger.debug("DirectCompare", "Activating Direct-Compare on the scene", 5);

    var collections = IQHN.Scene.getCurrentScene().getCollections();

    var percents = [];

    for (var col_count = 0; col_count < collections.length; col_count++) {
        var curr_col = collections[col_count];
        this.compareCollection_(curr_col);
    }
};

IQHN.DirectCompare.prototype.deactivate = function () {

    IQHN.Debugger.debug("DirectCompare", "Deactivating Direct-Compare on the scene", 5);

    var collections = IQHN.Scene.getCurrentScene().getCollections();


    for (var col_count = 0; col_count < collections.length; col_count++) {

        var curr_col = collections[col_count];
        this.resetCollection_(curr_col);
    }
};

IQHN.DirectCompare.prototype.compareCollection_ = function (collection) {

    var config = IQHN.config.collection.compare;
    var recs = collection.getRecommendations();

    var parent_rec_ids = this.getParentsRecIds_(collection);

    var found_num_recs_in_parent = 0;

    for (var rec_count = 0; rec_count < recs.length; rec_count++) {

        var curr_rec = recs[rec_count];

        var eexcess_rec_id = curr_rec.getEexcessData().result.id;

        var found_in_parent = false;
        if (parent_rec_ids.indexOf(eexcess_rec_id) >= 0)
            found_in_parent = true;

        var color = config.color_neg;
        if (found_in_parent) {
            color = config.color_pos;
            found_num_recs_in_parent++;
        }
        curr_rec.setColor(color);
    }

    var percent_found = found_num_recs_in_parent / recs.length * 100;

    this.removeBarFromCollection_(collection);
    var compare_bar = new IQHN.DirectCompareBar(collection, percent_found);
    this.addBarToCollection_(collection, compare_bar);
};

/**
 * Returns a list of all eexcess-recommendation-ids of the parent's recommendations
 * @param {IQHN.Collection} collection
 * @returns {Array} holding all eexcess-recommendation-ids of the parent collection
 */
IQHN.DirectCompare.prototype.getParentsRecIds_ = function (collection) {

    var parent_id = collection.getParentId();

    if (parent_id === null)
        return [];

    var parent_collection = IQHN.Scene.getCurrentScene().getCollection(parent_id);

    if (!parent_collection)
        throw ("ERROR: CAN'T LOAD COLLECTION WITH ID " + parent_id);

    var parent_recs = parent_collection.getRecommendations();

    var rec_ids = [];
    for (var i = 0; i < parent_recs.length; i++) {
        rec_ids.push(parent_recs[i].getEexcessData().result.id);
    }

    return rec_ids;
};

IQHN.DirectCompare.prototype.resetCollection_ = function (collection) {

    var recs = collection.getRecommendations();
    var default_color = IQHN.config.collection.recommendation.color;

    for (var rec_count = 0; rec_count < recs.length; rec_count++) {

        var curr_rec = recs[rec_count];

        var color = parseInt(default_color);
        curr_rec.setColor(color);
    }

    this.removeBarFromCollection_(collection);
};

/**
 * Remove @see{IQHN.DirectCompareBar} from Collection
 * @param {IQHN.Collection} collection
 */
IQHN.DirectCompare.prototype.removeBarFromCollection_ = function (collection) {

    var gl_objs = collection.getGlObjects();

    if (gl_objs.compare_bar) {
        gl_objs.compare_bar.delete();
        gl_objs.compare_bar = null;
        collection.setIsDirty(true);
    }
};

/**
 * Add @see{IQHN.DirectCompareBar} to Collection
 * @param {IQHN.Collection} collection
 */
IQHN.DirectCompare.prototype.addBarToCollection_ = function (collection, bar) {

    var gl_objs = collection.getGlObjects();
    gl_objs.compare_bar = bar;
    collection.setIsDirty(true);
};