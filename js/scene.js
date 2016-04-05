var IQHN = IQHN || {};

/** @constructor 
 *  @param {Object} canvas_element jQuery-object of the container holding the canvas
 */
IQHN.Scene = function (canvas) {

    IQHN.Scene.current_scene = this;

    /**
     * Switch between RING and BOW for different positioning on a virtual ring
     */
    this.vis_type_ = IQHN.config.scene.possible_vis_types.BOW;

    /** @type {IQHN.NavigationHandler} **/
    this.navigation_handler_ = new IQHN.NavigationHandler(this);

    /** @type {IQHN.Filterhandler} **/
    this.filter_handler_ = new IQHN.FilterHandler(this);

    this.db_handler_ = null;

    /** @type {IQHN.RecDashboardHandler} **/
    this.recdashboard_handler_ = new IQHN.RecDashboardHandler();

    /** @type{IQHN.WebGlHandler} **/
    this.webgl_handler_ = new IQHN.WebGlHandler(canvas);

    /** @type {IQHN.InteractionHandler} **/
    this.interaction_handler_ = new IQHN.InteractionHandler(this);

    /** @type{IQHN.CollectionPosCircular} **/
    this.collection_position_handler_ = new IQHN.CollectionPosCircular(this.vis_type_);

    /** @type{IQHN.Scene} **/
    this.forms_ = new IQHN.Forms(this);

    /** @type{IQHN.Animation} **/
    this.animation_ = new IQHN.Animation();

    this.time_ = {
        current: null,
        delta: null
    };

    this.compare_ = {
        direct: new IQHN.DirectCompare()
    };

    /** @type{IQHN.RecConnector} **/
    this.recconnector_ = new IQHN.RecConnector(this);

    /**
     * Holding @see{IQHN.Collection} objects
     */
    this.collections_ = [];

    //Reset counter of collections / recs
    IQHN.Collection.current_id = 0;
    IQHN.Recommendation.current_id = 0;
};

/**
 * Rendering the whole scene and all its sub-objects
 */
IQHN.Scene.prototype.render = function () {

    //this.getNavigationHandler().moveCameraAroundCircle(0.1, 0);

    //Set Time Delta for performance-independent animation speed
    this.time_.current = this.time_.current || Date.now();
    var now = Date.now();
    this.time_.delta = now - this.time_.current;
    this.time_.current = Date.now();


    for (var i = 0; i < this.collections_.length; i++) {
        this.collections_[i].render();
    }
    this.webgl_handler_.render();


    this.animation_.animate();
};

/**
 * Adding a collection to the scene
 * @param {IQHN.Collection} collection
 */
IQHN.Scene.prototype.addCollection = function (collection) {
    this.collections_.push(collection);

};

/**
 * Returning all registered collections
 * @returns {Array}
 */
IQHN.Scene.prototype.getCollections = function () {
    return this.collections_;
};

/**
 * Getter for the WebGlHandler
 * @returns {IQHN.WebGlHandler}
 */
IQHN.Scene.prototype.getWebGlHandler = function () {
    return this.webgl_handler_;
};

/**
 * Getter for the NavigationHandler
 * @returns {IQHN.NavigationHandler}
 */
IQHN.Scene.prototype.getNavigationHandler = function () {
    return this.navigation_handler_;
};

/**
 * Getter for the FilterHandler
 * @returns {IQHN.FilterHandler}
 */
IQHN.Scene.prototype.getFilterHandler = function () {
    return this.filter_handler_;
};

/**
 * Getter for the Animation-Object
 * @returns {IQHN.Animation}
 */
IQHN.Scene.prototype.getAnimation = function () {
    return this.animation_;
};

/**
 * Getter for the Rec-Dashboard-Handler
 * @returns {IQHN.RecDashboardHandler}
 */
IQHN.Scene.prototype.getRecDashboardHandler = function () {
    return this.recdashboard_handler_;
};

/**
 * Getter for the Interaction-Handler
 * @returns {IQHN.InteractionHandler}
 */
IQHN.Scene.prototype.getInteractionHandler = function () {
    return this.interaction_handler_;
};

/**
 * Returning the scene's position handler for the collections
 * @returns {IQHN.CollectionPosLinear}
 */
IQHN.Scene.prototype.getCollectionPositionHandler = function () {
    return this.collection_position_handler_;
};

/**
 * Returning the scene's compare objects
 * @returns {}
 */
IQHN.Scene.prototype.getComparer = function () {
    return this.compare_;
};

/**
 * Returns the Rec-Connector, that is responsible for (spline) connections
 * between recommendations over several collections
 * @returns {IQHN.RecConnector}
 */
IQHN.Scene.prototype.getRecConnector = function () {
    return this.recconnector_;
};

/**
 * Get the scene's form handler
 * @returns {IQHN.Forms}
 */
IQHN.Scene.prototype.getForms = function () {
    return this.forms_;
};

/**
 * 
 * @returns {float} Time Delta for calculating animation steps
 */
IQHN.Scene.prototype.getTimeDelta = function () {
    return this.time_.delta;
};


/**
 * 
 * @returns {integer} Get vis-type flag (e.g. ring or bow)
 */
IQHN.Scene.prototype.getVisType = function () {
    return this.vis_type_;
};

/**
 * 
 * @param {integer} collection_id
 * @returns {IQHN.Collection || null}
 */
IQHN.Scene.prototype.getCollection = function (collection_id) {

    collection_id = parseInt(collection_id);

    for (var key = 0; key < this.collections_.length; key++) {
        if (this.collections_[key].getId() === collection_id)
            return this.collections_[key];

    }
    return null;
};

/**
 * Sets positions of the loaded collections and connects them with a connection
 * @returns {undefined}
 */
IQHN.Scene.prototype.initCollectionNetwork = function () {
    this.getCollectionPositionHandler().calculatePositions();

    //Creating parent connections
    for (var key = 0; key < this.collections_.length; key++) {
        this.collections_[key].updateParentConnection();
    }
};


/**
 * Responsible for cleaning up before deleting the scene
 */
IQHN.Scene.prototype.cleanup = function(){
   
    window.cancelAnimationFrame(IQHN.Scene.requ_anim_id);
    
    this.interaction_handler_.cleanup();
    this.navigation_handler_.cleanup();
    delete this.interaction_handler_;
    delete this.navigation_handler_;
   
    this.webgl_handler_.cleanup();
    
    for (var i=0; i< this.getCollections().length; i++) {
        this.getCollections()[i].cleanup();
    }
    
};


/******************
 * 
 * Static functions
 * 
 ******************/


IQHN.Scene.current_scene = null;


IQHN.Scene.VISTYPE = {
    RING: 0x1,
    BOW: 0x2
};

/**
 * Get current scene
 * @returns {IQHN.Scene || null}
 */
IQHN.Scene.getCurrentScene = function () {
    if (!this.current_scene)
        return null;
    return this.current_scene;
};


var stop_flag = false;

var animation_debugger = null;
// animation_debugger = new IQHN.AnimationDebugger();

/**
 * Main entry-point for the animation
 */
IQHN.Scene.animate = function () {
    var curr_scene = IQHN.Scene.getCurrentScene();

    if (!curr_scene || stop_flag)
        return;


    IQHN.Scene.requ_anim_id = window.requestAnimationFrame(IQHN.Scene.animate);
    curr_scene.render();

    if (animation_debugger)
        animation_debugger.update();
};