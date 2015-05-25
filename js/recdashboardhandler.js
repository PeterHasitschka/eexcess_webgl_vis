var GLVIS = GLVIS || {};


GLVIS.RecDashboardHandler = function(){
    
    
};

/**
 * Handles visualization of click on collection in rec-dashboard html
 * @param {GLVIS.Collection} collection
 */
GLVIS.RecDashboardHandler.prototype.onCollectionClick = function(collection){
     jQuery('#webgl_info_title').html('Query/Collection #' + collection.getId());

    var info_content_container = jQuery('#webgl_info_content');
    info_content_container.html("");
    info_content_container.append('<p>Name: ' + collection.graph_name_ + "</p>");
    info_content_container.append('<p>Results: ' + collection.getResults().length + "</p>");
};


