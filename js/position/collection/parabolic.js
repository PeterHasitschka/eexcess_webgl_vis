var GLVIS = GLVIS || {};

/**
 * This position handler sets all collections on a hyperbolic path next to their parents.
 * This means that only one child per collections is supported.
 * @returns {undefined}
 */
GLVIS.CollectionPosParabolic = function () {

    /** @type {GLVIS.Scene} **/
    this.scene_ = GLVIS.Scene.getCurrentScene();

    this.is_onefocused_ = false;
    this.coll_to_focus_ = null;

};

/**
 * Sets the positions of each collections
 */
GLVIS.CollectionPosParabolic.prototype.calculatePositions = function () {

    GLVIS.Debugger.debug("CollectionPosParabolic",
            "COLLECTION POS HANDLER: Recalculating positions",
            5);


    var coll_to_focus = this.getCollToFocus();
    var collections = this.scene_.getCollections();

    if (!collections.length)
        return;

    //Store parent-id and key in an array to sort it
    var parent_mapping = [];
    for (var coll_key = 0; coll_key < collections.length; coll_key++) {

        /** @type{GLVIS.Collection} **/
        var current_collection = collections[coll_key];

        var coll_id = current_collection.getId();
        var coll_parent_id = current_collection.getParentId();

        parent_mapping.push([coll_key, coll_parent_id]);
    }

    //Sort array
    parent_mapping.sort(function (a, b) {
        if (b[1] === null)
            return a;

        return a[1] - b[1];
    });



    var x_step = GLVIS.config.collection.init_distance;

    if (this.is_onefocused_) {
        x_step /= 4;
    }


    var last_x = 0;

    var last_coll = null;
    for (var coll_count = 0; coll_count < parent_mapping.length; coll_count++) {
        var collection_key = parent_mapping[coll_count][0];

        /** @type{GLVIS.Collection} **/
        var current_collection = collections[collection_key];


        var neighbor_fact = 1;
        if (this.is_onefocused_ && coll_to_focus && !focus_last) {

            if ((current_collection.getId() - 1) === coll_to_focus.getId() ||
                    current_collection.getId() === coll_to_focus.getId())
                neighbor_fact = 2;
        }


        var curr_x = last_x + x_step * neighbor_fact;
        last_x = curr_x;

        if (this.is_onefocused_) {
            if (current_collection.getId() !== coll_to_focus.getId()) {
                current_collection.setRotation((current_collection.getId() < coll_to_focus.getId() ? -1 : 1) * 80, true);
                current_collection.hideLabels();
            }
            else
                current_collection.showLabels();
        }
        else {
            current_collection.setRotation(0);
            current_collection.showLabels();
        }


        current_collection.setPosition(curr_x, null);


        var last_coll = current_collection;
    }

    if (focus_last)
        coll_to_focus = last_coll;


    /**
     * Focus last collection
     * @type {GLVIS.NavigationHandler} navigation_handler
     */
    var navigation_handler = GLVIS.Scene.getCurrentScene().getNavigationHandler();
    if (coll_to_focus) {
        navigation_handler.focusCollection(coll_to_focus, function () {
            GLVIS.Debugger.debug("CollectionPosParabolic",
                    "COLLECTION LINEAR POS: Ready positioning and focusing",
                    6);
        });
    }

};




/**
 * 
 * @param {boolean} value True if a focus representation should be performed
 * @returns {undefined}
 */
GLVIS.CollectionPosParabolic.prototype.setIsOneFocused = function (value) {
    this.is_onefocused_ = value;
};

/**
 * @returns {Boolean} True if onefocus flag is set
 */
GLVIS.CollectionPosParabolic.prototype.getIsOneFocused = function () {
    return this.is_onefocused_;
};

/**
 * Set Collection that gets focused after rendering the collections
 * @param {GLVIS.Collection} coll
 */
GLVIS.CollectionPosParabolic.prototype.setCollToFocus = function (coll) {
    this.coll_to_focus_ = coll;
};

/**
 * Get Collection that is set to be focused after rendering the collections
 * @returns {GLVIS.Collection}
 */
GLVIS.CollectionPosParabolic.prototype.getCollToFocus = function () {
    return this.coll_to_focus_;
};
