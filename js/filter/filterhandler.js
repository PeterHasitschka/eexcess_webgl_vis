var GLVIS = GLVIS || {};



GLVIS.FilterHandler = function () {

    this.filters_ = [];


};

/**
 * Add a filter
 * @param {GLVIS.Filter} filter
 */
GLVIS.FilterHandler.prototype.addFilter = function (filter) {

    var key = filter.getKey();

    //Remove former filters with this key
    for (var i = 0; i < this.filters_.length; i++) {
        var curr_f = this.filters_[i];

        if (curr_f.getKey() === key) {
            this.filters_.splice(i, 1);
            break;
        }
    }

    this.filters_.push(filter);
};

/**
 * Remove filter.
 * @param {string} identifier filter identifier string (e.g. 'language'
 */
GLVIS.FilterHandler.prototype.removeFilter = function (identifier) {


    for (var i = 0; i < this.filters_.length; i++) {
        var curr_f = this.filters_[i];

        if (curr_f.getKey().identifier === identifier) {
            this.filters_.splice(i, 1);
            return;
        }
    }
};

/**
 * Apply updated filter to the collections
 */
GLVIS.FilterHandler.prototype.apply = function () {


    var collections = GLVIS.Scene.getCurrentScene().getCollections();

    for (var i = 0; i < collections.length; i++) {

        //Remove splines because of possible movement of recs
        /** @type {GLVIS.Collection} */
        var curr_col = collections[i];
        curr_col.unconnectSameRecsFromOtherCollections();

        var recs = curr_col.getRecommendations();

        for (var j = 0; j < recs.length; j++) {
            /** @type{GLVIS.Recommendation} **/
            var curr_rec = recs[j];

            var filter_res = this.applyFiltersToRec_(curr_rec);
            console.log(curr_rec.getId(), filter_res);
        }

        this.updateRingFilterSegments(curr_col);
    }

};

/**
 * Update the status of the ring segments of a possible ring-structure
 * @param {GLVIS.Collection} collection
 */
GLVIS.FilterHandler.prototype.updateRingFilterSegments = function (collection) {

    /** @type {GLVIS.RingRepresentation} **/
    var ringrep = collection.getRingRepresentation();
    if (!ringrep)
        return;

    var segs = ringrep.getRingSegments();

    for (var i = 0; i < segs.length; i++) {

        /** @type{GLVIS.RingSegment} **/
        var seg = segs[i];
        var seg_key = seg.getKey().id;
        var seg_val = seg.getValue();

        //Check against current filters! And also against removed filters!
        var filters = this.getFilters();

        var filter_match = false;
        for (var j = 0; j < filters.length; j++) {
            /** @type{GLVIS.Filter} **/
            var curr_f = filters[j];

            var f_key = curr_f.getKey().identifier;
            var f_val = curr_f.getValue();

            if (f_key === seg_key && f_val === seg_val) {
                filter_match = true;
                seg.select(true);
                break;
            }
        }
        if (!filter_match) {
            seg.deSelect(true);
        }
    }
};

/**
 * Private method to apply all filters to Recommendation
 * @param {GLVIS.Recommendation} rec
 */
GLVIS.FilterHandler.prototype.applyFiltersToRec_ = function (rec) {

    var filter_positive = [];

    for (var i = 0; i < this.filters_.length; i++) {

        /** @type {GLVIS.Filter} **/
        var curr_filter = this.filters_[i];


        switch (curr_filter.getKey().type) {

            case "eexcess" :
                var e_data = rec.getEexcessData();
                var data_element = (String)(e_data.result.facets[curr_filter.getKey().identifier]);
                if (data_element === undefined) {
                    throw ("EEXCESS Result-Data '" + curr_filter.getKey().identifier + "' not found!");
                }
                if (data_element.indexOf(curr_filter.getValue()) < 0) {

                    rec.setFilterPositive(false);
                    filter_positive.push(curr_filter.getKey().identifier);
                }

                break;

                throw ("Filter Type '" + curr_filter.getType().type + "' not supported yet!");
        }
    }

    if (!filter_positive.length)
        rec.setFilterPositive(true);
    return filter_positive;
};

/**
 * Get all registered filters
 * @returns {[GLVIS.Filter]}
 */
GLVIS.FilterHandler.prototype.getFilters = function () {
    return this.filters_;
};


/**
 * Returns true if a filter with key and val is currently applied
 * @param {string} key
 * @param {string} value
 * @returns {Boolean}
 */
GLVIS.FilterHandler.prototype.isFilterApplied = function (key, value) {

    var fs = this.getFilters();
    for (var i = 0; i < fs.length; i++) {
        /** @var{GLVIS.Filter} **/
        var curr_f = fs[i];
        if (curr_f.getKey().identifier === key && curr_f.getValue() === value)
            return true;
    }

    return false;
};