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
    var filter_rec_res = [];
    for (var i = 0; i < collections.length; i++) {

        //Remove splines because of possible movement of recs
        /** @type {GLVIS.Collection} */
        var curr_col = collections[i];
        curr_col.unconnectSameRecsFromOtherCollections();

        var recs = curr_col.getRecommendations();


        for (var j = 0; j < recs.length; j++) {
            /** @type{GLVIS.Recommendation} **/
            var curr_rec = recs[j];

            filter_rec_res.push({rec: curr_rec, positive_filters: this.applyFiltersToRec_(curr_rec)});
        }
        this.updateRingFilterSegments(curr_col);
    }

    this.sendFilterRecResForDashboard(filter_rec_res);
};

/**
 * Take an array with elements that each represents the filters positively applied to a rec.
 * Combine them by filter-name to send them to the Dashboard via recdashboard-handler
 * @param {object} data containing rec and positive filters
 * @returns {undefined}
 */
GLVIS.FilterHandler.prototype.sendFilterRecResForDashboard = function (data) {

    var filters = {};

    for (var i = 0; i < data.length; i++) {

        var rec = data[i].rec;
        var recs_filters = data[i].positive_filters;


        for (var j = 0; j < recs_filters.length; j++) {

            if (filters[recs_filters[j].id] === undefined)
                filters[recs_filters[j].id] = {val: recs_filters[j].val, res: []};
            filters[recs_filters[j].id].res.push(rec.getEexcessData().result);
        }


    }
    GLVIS.Scene.getCurrentScene().getRecDashboardHandler().applyFilters(filters);



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

    var at_least_one_negative = false;
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
                if (data_element !== curr_filter.getValue()) {
                    at_least_one_negative = true;
                }
                else
                    filter_positive.push({id: curr_filter.getKey().identifier, val: data_element});

                break;

                throw ("Filter Type '" + curr_filter.getType().type + "' not supported yet!");
        }
    }


    if (!at_least_one_negative) {
        rec.setFilterPositive(true);
    }
    else {
        rec.setFilterPositive(false);
    }

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