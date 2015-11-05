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


GLVIS.RecDashboardHandler.prototype.openBookmarkForm = function (rec) {

    if (!visTemplate) {
        console.error("Could not find 'visTemplate' object for communicating with the bookmark dialog!");
        return false;
    }

    var events = GLVIS.Scene.getCurrentScene().getInteractionHandler().getEvents();
    events.md.stopPropagation();
    events.mc.stopPropagation();


    var d = rec.getEexcessData().result;
    var i = null;
    visTemplate.getBookmarkObj().buildSaveBookmarkDialog(
            d,
            function (thisValue) {
                thisValue.internal.setCurrentItem(d, i);
            },
            function (bookmarkDetails) {
                bookmarkDetails.append('p').text(d.title);
            },
            visTemplate.getEventHandlerObj().bookmarkSaveButtonClicked,
            this);
};

