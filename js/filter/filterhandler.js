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
 * @param {identifier} filter identifier string (e.g. 'language'
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
        var recs = collections[i].getRecommendations();

        for (var j = 0; j < recs.length; j++) {
            /** @type{GLVIS.Recommendation} **/
            var curr_rec = recs[j];

            this.applyFiltersToRec_(curr_rec);
        }
    }

};

/**
 * Private method to apply all filters to Recommendation
 * @param {GLVIS.Recommendation} rec
 */
GLVIS.FilterHandler.prototype.applyFiltersToRec_ = function (rec) {

    //Switch between eexcess stuff and other HERE

    //------------>

    for (var i = 0; i < this.filters_.length; i++) {

        /** @type {GLVIS.Filter} **/
        var curr_filter = this.filters_[i];


        switch (curr_filter.getKey().type) {

            case "eexcess" :
                var e_data = rec.getEexcessData();
                var data_element = e_data.result.facets[curr_filter.getKey().identifier];
                if (data_element === undefined) {
                    throw ("EEXCESS Result-Data '" + curr_filter.getKey().identifier + "' not found!");
                }

                if (data_element.indexOf(curr_filter.getValue()) < 0) {

                    rec.setFilterPositive(false);
                    return false;
                }

                break;

                throw ("Filter Type '" + curr_filter.getType().type + "' not supported yet!");
        }
    }

    rec.setFilterPositive(true);

};

/**
 * Get all registered filters
 * @returns {[GLVIS.Filter]}
 */
GLVIS.FilterHandler.prototype.getFilters = function () {
    return this.filters_;
};