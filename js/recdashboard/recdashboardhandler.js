var GLVIS = GLVIS || {};


GLVIS.RecDashboardHandler = function () {

    this.last_clicked_rec = null;
    this.last_clicked_col = null;

    this.toolbar = new GLVIS.ToolbarHandler();
};

/**
 * Handles visualization of click on collection in rec-dashboard html
 * @param {GLVIS.Collection} collection
 */
GLVIS.RecDashboardHandler.prototype.onCollectionClick = function (collection) {
    this.last_clicked_col = collection;
    this.toolbar.getButton("rec_focusparentcol").hide();
};


/**
 * Handles visualization of click on recommendation in rec-dashboard html
 * @param {GLVIS.Recommendation} recommendation
 */
GLVIS.RecDashboardHandler.prototype.onRecommendationClick = function (recommendation) {
    this.last_clicked_rec = recommendation;
    this.toolbar.getButton("rec_focusparentcol").show();
};

/**
 * Open the vis-dashboard's bookmark dialog for saving a recommendation in a bookmark
 * @param {GLVIS.Recommendation} rec
 * @returns {Boolean}
 */
GLVIS.RecDashboardHandler.prototype.openBookmarkForm = function (rec) {

    if (!visTemplate) {
        console.error("Could not find 'visTemplate' object for communicating with the bookmark dialog!");
        return false;
    }

    var events = GLVIS.Scene.getCurrentScene().getInteractionHandler().getEvents();
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
 * @param {GLVIS.Recommendation} rec
 * @returns {null|Integer}
 */
GLVIS.RecDashboardHandler.prototype.determineListIndex = function (rec) {
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
