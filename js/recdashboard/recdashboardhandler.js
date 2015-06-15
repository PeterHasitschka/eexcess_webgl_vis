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
    jQuery('#webgl_info_title').html('Query/Collection #' + collection.getId());

    var info_content_container = jQuery('#webgl_info_content');
    info_content_container.html("");

    this.last_clicked_col = collection;

    this.toolbar.getButton("rec_focusparentcol").hide();
};


/**
 * Handles visualization of click on recommendation in rec-dashboard html
 * @param {GLVIS.Recommendation} recommendation
 */
GLVIS.RecDashboardHandler.prototype.onRecommendationClick = function (recommendation) {
    jQuery('#webgl_info_title').html('Recommendation #' + recommendation.getId());

    var info_content_container = jQuery('#webgl_info_content');
    info_content_container.html("");

    this.last_clicked_rec = recommendation;
    this.toolbar.getButton("rec_focusparentcol").show();
};