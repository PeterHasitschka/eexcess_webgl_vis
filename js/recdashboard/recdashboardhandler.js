var IQHN = IQHN || {};


IQHN.RecDashboardHandler = function () {

    this.last_clicked_rec = null;
    this.last_clicked_col = null;

    this.toolbar = new IQHN.ToolbarHandler();
};

/**
 * Handles visualization of click on collection in rec-dashboard html
 * @param {IQHN.Collection} collection
 */
IQHN.RecDashboardHandler.prototype.onCollectionClick = function (collection) {
    this.last_clicked_col = collection;
    this.toolbar.getButton("rec_focusparentcol").hide();
};


/**
 * Handles visualization of click on recommendation in rec-dashboard html
 * @param {IQHN.Recommendation} recommendation
 */
IQHN.RecDashboardHandler.prototype.onRecommendationClick = function (recommendation) {
    this.last_clicked_rec = recommendation;
    this.toolbar.getButton("rec_focusparentcol").show();
};

/**
 * Open the vis-dashboard's bookmark dialog for saving a recommendation in a bookmark
 * @param {IQHN.Recommendation} rec
 * @returns {Boolean}
 */
IQHN.RecDashboardHandler.prototype.openBookmarkForm = function (rec) {

    if (!visTemplate) {
        console.error("Could not find 'visTemplate' object for communicating with the bookmark dialog!");
        return false;
    }

    var events = IQHN.Scene.getCurrentScene().getInteractionHandler().getEvents();
    events.md.stopPropagation();
    events.mc.stopPropagation();

    var list_index = this.determineListIndex(rec);

    console.log("list_index: " + list_index);

    var d = rec.getEexcessData().result;
    visTemplate.getBookmarkObj().buildSaveBookmarkDialog(
            d,
            function (thisValue) {
                thisValue.internal.setCurrentItem(d, list_index);
            },
            function (bookmarkDetails) {
                bookmarkDetails.append('p').text(d.title);
            },
            visTemplate.getEventHandlerObj().bookmarkSaveButtonClicked,
            this);
    return true;
};

/**
 * Determine the index of the current rec in the vis' result list.
 * If not in list it's getting set to null.
 * @param {IQHN.Recommendation} rec
 * @returns {null|Integer}
 */
IQHN.RecDashboardHandler.prototype.determineListIndex = function (rec) {
    if (!visTemplate) {
        console.error("Could not find 'visTemplate' object for communicating with the Result-List!");
        return false;
    }

    var dashboard_data = visTemplate.getData();
    var e_data = rec.getEexcessData().result;
    //get current index
    for (var i = 0; i < dashboard_data.length; i++) {
        if (dashboard_data[i].id === e_data.id)
            return dashboard_data[i].index;
    }
    return null;
};


IQHN.RecDashboardHandler.prototype.applyFilters = function (filters) {

    console.log(filters);
    console.warn("TODO: Apply filters to rec-dashboard sidebar!!!");
   
    /**
     * Due to problems with the FilterHandler.setCurrentFilter ... Methods
     * we deactivated the filter-setting currently...
     * P.H. 13.11.15
     */
    
    var curr_col = IQHN.Collection.curr_focus_coll;
    var filterAllData = [];
    
    for (var i=0; i< curr_col.getRecommendations().length; i++) {
        var curr_rec = curr_col.getRecommendations()[i];
        filterAllData.push(curr_rec.getEexcessData().result);
    }
    
    FilterHandler.setOverwriteCollectionData(filterAllData);
    for (var key in filters) {
        
        
        switch (key) {

            case 'year' :
                FilterHandler.setCurrentFilterRange('time', filters[key].res, [filters[key].val], [filters[key].val], '');
                break;
            default:
                FilterHandler.setCurrentFilterCategories('category', filters[key].res, key, [filters[key].val]);
        }
    }
    
    FilterHandler.resetOverwriteCollectionData();
};