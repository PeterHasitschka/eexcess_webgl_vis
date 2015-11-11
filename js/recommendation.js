

var GLVIS = GLVIS || {};

/**
 * Holding information and GL-Representations of one search Result / One Recommendation
 * @param {object} eexcess_data Data from the database
 * @param {GLVIS.Collection} collection optional collection
 * @returns {undefined}
 */
GLVIS.Recommendation = function (eexcess_data, collection) {

    /**
     * Internal increment id
     */
    this.id_ = GLVIS.Recommendation.getNewId();

    /**
     * Collection that has this recommendation
     * @type{GLVIS.Collection} 
     */
    this.collection_ = collection ? collection : null;

    /**
     * Data like urls, timestamp etc.
     */
    this.eexcess_data_ = eexcess_data;

    /**
     * True if recommendation changed and needs to be re-rendered
     */
    this.dirty_ = true;




    /**
     * Everything related to visualization
     */
    this.vis_data_ = {
        status: GLVIS.Recommendation.STATUSFLAGS.NORMAL,
        relative_position: {
            x: 0,
            y: 0,
            z: 0
        },
        radius: GLVIS.config.collection.recommendation.radius,
        color: 0x000000,
        color_data: GLVIS.Recommendation.COLORDATA.LANGUAGE,
        spline_color: null,
        opacity: 1,
        distance_factor: 1,
        size_factor: 1,
        relevance: 1,
        relevance_shown: false,
        is_filter_positive: true,
        gl_objects: {
            center_node: null,
            connection_col: null
        }
    };

    /**
     * Connections to other objects (e.g parent-collection)
     */
    this.connections_ = {
        to_collection: null,
        splines: []
    };

    this.initGlNode();

    GLVIS.Debugger.debug("Recommendation",
            "Recommendation with id " + this.id_ + " created!",
            6);
};


/**
 * Add a spline to the recommendation
 * @param {GLVIS.ConnectionRecRecSpline} spline
 * @returns {undefined}
 */
GLVIS.Recommendation.prototype.registerRecSpline = function (spline) {
    this.connections_.splines.push(spline);
};

/**
 * Returns a (random) color value for a spline.
 * @returns {integer}
 */
GLVIS.Recommendation.prototype.getSplineColor = function () {
    if (!this.vis_data_.spline_color) {
        var config = GLVIS.config.connection.rec_spline;
        this.vis_data_.spline_color = config.base_color - parseInt(Math.random() * config.color_diff);
    }
    return this.vis_data_.spline_color;
};


/**
 * Remove a registered spline from the recommendation
 * @param {GLVIS.ConnectionRecRecSpline} spline
 * @returns {undefined}
 */
GLVIS.Recommendation.prototype.unregisterRecSpline = function (spline) {

    var index = _.indexOf(this.connections_.splines, spline);
    if (index >= 0) {
        this.connections_.splines = this.connections_.splines.splice(index, 1);
    }
};

GLVIS.Recommendation.prototype.deleteAllRecSplines = function () {

    _.each(this.connections_.splines, function (spline) {
        if (!spline)
            return;
        spline.delete();
        delete spline;
    });

    this.connections_.splines = [];
};


/**
 * Creating a common-node for representing the recommendation
 * @returns {undefined}
 */
GLVIS.Recommendation.prototype.initGlNode = function () {

    var gl_node = new GLVIS.RecommendationCommonNode(this, this.getCollection().getMeshContainerNode());
    this.vis_data_.gl_objects.center_node = gl_node;

    var gl_connection = new GLVIS.ConnectionCollectionRecommendation(this, this.getCollection().getMeshContainerNode());
    this.vis_data_.gl_objects.connection_col = gl_connection;

    this.setBaseColor();
    this.setRelativePositionByRad(0);
};


/**
 * 
 * @param {GLVIS.Recommendation.COLORDATA} colordata
 * @returns {undefined}
 */
GLVIS.Recommendation.prototype.setColorData = function (colordata) {
    this.vis_data_.color_data = colordata;
};

/**
 * Set node-color depending on the eexcess-data
 */
GLVIS.Recommendation.prototype.setBaseColor = function () {


    var color = GLVIS.config.collection.recommendation.init_color;


    var config = GLVIS.config.collection.recommendation.colors;

    if (!config[this.vis_data_.color_data]) {
        throw ("Color-data " + this.vis_data_.color_data + " not found");
    }

    var facet_color_data = config[this.vis_data_.color_data];
    var facets = this.eexcess_data_.result.facets;

    if (facets[this.vis_data_.color_data] === undefined)
        throw("Facet " + this.vis_data_.color_data + " not found");

    var facet_val = facets[this.vis_data_.color_data];

    if (config[this.vis_data_.color_data][facet_val] !== undefined)
        color = config[this.vis_data_.color_data][facet_val];

    this.setColor(color);
}
;


/**
 * Render the collection and its subnodes
 */
GLVIS.Recommendation.prototype.render = function () {

    if (!this.dirty_)
        return;

    GLVIS.Debugger.debug("Recommendation",
            "Recommendation with id " + this.id_ + " rendered!",
            6);

    //Render all Gl-Objectss
    for (var key in this.vis_data_.gl_objects) {
        if (this.vis_data_.gl_objects.hasOwnProperty(key)) {
            if (this.vis_data_.gl_objects[key])
                this.vis_data_.gl_objects[key].render();
        }
    }

    this.dirty_ = false;
};

/**
 * Setting the collection that the recommendation belongs to
 * @param {GLVIS.Collection} collection Collection;
 */
GLVIS.Recommendation.prototype.setCollection = function (collection) {
    this.collection_ = collection;
};

/**
 * Called by interactionhandler. Function registered in mesh-objects
 * @returns {undefined}
 */
GLVIS.Recommendation.prototype.handleDetailNodeClick = function () {
    if (this.getStatus() === GLVIS.Recommendation.STATUSFLAGS.HIDDEN)
        return;

    GLVIS.Debugger.debug("Recommendation",
            ["RECOMMENDATION " + this.getId() + " clicked", this],
            3);

    //Don't do focus etc. if clicked before --> Zoom out to collection
    /*
     if (GLVIS.Recommendation.current_selected_rec && GLVIS.Recommendation.current_selected_rec === this) {
     this.defocusAndZoomOut();
     return;
     }
     */

    this.focusAndZoom();

};

/**
 * If Click on common node: First create ring-rep (with detail nodes) then click on new detail node
 */
GLVIS.Recommendation.prototype.handleCommonNodeClick = function () {


    if (this.getCollection().getStatus() === GLVIS.Collection.STATUSFLAGS.HIDDEN)
        return;

    if (!this.getCollection().getRingRepresentation())
        this.getCollection().createRingRepresentation(function () {
            this.handleDetailNodeClick();
        }.bind(this));

};


GLVIS.Recommendation.prototype.handleMouseover = function () {

    //Do not show rec-splines when zoomed in to rec
    if (GLVIS.Recommendation.current_selected_rec && GLVIS.Recommendation.current_selected_rec === this)
        return;



    /** @type {GLVIS.RecConnector} **/
    var connector = GLVIS.Scene.getCurrentScene().getRecConnector();
    connector.connectSameRecs(this);
    GLVIS.RecConnector.activatedAtSingleRecs.push(this);
};

/**
 * Swap the (no detailed) common node object with a Detail-Node.
 * Afterwards zoom and move in to the recommendation
 */
GLVIS.Recommendation.prototype.focusAndZoom = function () {

    //Replace common node with detail node
    GLVIS.Debugger.debug("Recommendation", "Setting node type to DETAILED and zoom in afterwards", 5);
    this.setNodeType(GLVIS.Recommendation.NODETYPES.DETAILED);

    var nav_handler = GLVIS.Scene.getCurrentScene().getNavigationHandler();
    nav_handler.focusRecommendation(this);


    if (GLVIS.Recommendation.current_selected_rec) {
        //GLVIS.Debugger.debug("Recommendation", "Setting node type to COMMON of FORMER FOCUSED", 5);
        //GLVIS.Recommendation.current_selected_rec.setNodeType(GLVIS.Recommendation.NODETYPES.COMMON);
    }

    if (GLVIS.Recommendation.current_selected_rec)
        GLVIS.Recommendation.current_selected_rec.setDetailNodeButtonVisibility(false);
    this.vis_data_.gl_objects.center_node.setButtonsVisible(true);


    GLVIS.Recommendation.current_selected_rec = this;
    GLVIS.Scene.getCurrentScene().getRecDashboardHandler().onRecommendationClick(this);
};


GLVIS.Recommendation.prototype.setDetailNodeButtonVisibility = function (visible) {

    if (this.vis_data_.gl_objects.center_node instanceof GLVIS.RecommendationDetailNode)
        this.vis_data_.gl_objects.center_node.setButtonsVisible(visible);
};

/**
 * De-Focus the Recommendation node.
 * Swap the detail node to a common node and move and zoom to the collection
 */
GLVIS.Recommendation.prototype.defocusAndZoomOut = function () {

    //Replace detail node with common node
    this.vis_data_.gl_objects.center_node.setButtonsVisible(false);

    var scene = GLVIS.Scene.getCurrentScene();
    scene.getAnimation().stopCameraMovementAnimations();
    this.getCollection().selectAndFocus(function () {

    });

    GLVIS.Recommendation.current_selected_rec = null;
    GLVIS.Scene.getCurrentScene().getRecDashboardHandler().onRecommendationClick(this);
};

/**
 * Swap the node type (e.g. common node or detailed node).
 * Each other registered type of node will be deleted from the gl list and will
 * be destroyed.
 * @param {Object} type Instance of @see{GLVIS.Recommendation.NODETYPES}
 */
GLVIS.Recommendation.prototype.setNodeType = function (type) {

    var rec_node_type_exists = false;

    GLVIS.Debugger.debug("Recommendation", "Creating new node type.", 5);

    //Check if that kind of node already exists
    if (this.vis_data_.center_node instanceof type) {
        rec_node_type_exists = true;
        GLVIS.Debugger.debug("Recommendation", "Node of type " + type + " exists... skip creating it.", 6);
    }
    if (rec_node_type_exists)
        return;

    this.vis_data_.gl_objects.center_node.delete();

    //Create new node type
    var gl_node = new type(this, this.getCollection().getMeshContainerNode());
    this.vis_data_.gl_objects.center_node = gl_node;
    this.setIsDirty(true);
};

/**
 * Returns the Node depending on the LOD
 * @returns {GLVIS.RecommendationCommonNode | GLVIS.RecommendationDetailNode}
 */
GLVIS.Recommendation.prototype.getRecNode = function () {
    return this.vis_data_.gl_objects.center_node;
};

/**
 * Return parent-collection
 * @returns {GLVIS.Collection}
 */
GLVIS.Recommendation.prototype.getCollection = function () {
    return this.collection_;
};

/**
 * Getting the status of the Recommendation
 * See @see{GLVIS.Recommendation.STATUSFLAGS}
 * @returns {type}
 */
GLVIS.Recommendation.prototype.getStatus = function () {
    return this.vis_data_.status;
};

/**
 * Set the status of the Recommendation.
 * See @see{GLVIS.Recommendation.STATUSFLAGS}
 * @param {type} status
 * @returns {undefined}
 */
GLVIS.Recommendation.prototype.setStatus = function (status) {

    if (status === this.vis_data_.status)
        return;

    this.vis_data_.status = status;

    //Status change also means change of visual representation
    this.setIsDirty(true);
};

/**
 * Setting all sub-objects that hold GL Objects dirty
 */
GLVIS.Recommendation.prototype.setMyGlObjectsDirty_ = function () {

    for (var key in this.vis_data_.gl_objects) {
        if (this.vis_data_.gl_objects.hasOwnProperty(key) && this.vis_data_.gl_objects[key]) {
            this.vis_data_.gl_objects[key].setIsDirty(true);
        }
    }

    //Collection needs rendering too to reach recommendation
    //May be null when initializing gl objects.
    if (this.collection_)
        this.collection_.setIsDirty(true);
};

/**
 * Get Relative position to the collection
 * @returns {GLVIS.Recommendation.prototype.getPosition.pos}
 */
GLVIS.Recommendation.prototype.getRelativePosition = function () {
    return this.vis_data_.relative_position;
};

/**
 * Get Absolute position
 * @param {bool} physical Get Position of the mesh nodes (Necessary at e.g rotated recs)
 * @returns {GLVIS.Recommendation.prototype.getPosition.pos}
 */
GLVIS.Recommendation.prototype.getPosition = function (physical) {
    var coll_pos = this.getCollection().getPosition();

    var pos;
    if (!physical) {
        pos = {
            x: this.vis_data_.relative_position.x + coll_pos.x,
            y: this.vis_data_.relative_position.y + coll_pos.y,
            z: this.vis_data_.relative_position.z + coll_pos.z
        };
    }
    else {
        /**
         * Calculates the physical position of the rec.
         * E.g. if rotated around collection center, the relative position is not enough
         */
        var gl_node = this.vis_data_.gl_objects.center_node;

        if (!gl_node)
            throw ("Could not find gl-node of recommendation");

        //Necessary to update position of mesh
        gl_node.render();

        var circle_mesh = gl_node.getCircle();

        this.getCollection().getMeshContainerNode().updateMatrixWorld();

        pos = new THREE.Vector3();
        circle_mesh.localToWorld(pos);
    }


    return pos;
};

/**
 * Getting the relative position of the recommendation related to the collection
 * @returns {GLVIS.Recommendation.prototype.getRelativePosition.pos}
 */
GLVIS.Recommendation.prototype.getRelativePosition = function () {
    var pos = {
        x: this.vis_data_.relative_position.x,
        y: this.vis_data_.relative_position.y,
        z: this.vis_data_.relative_position.z
    };
    return pos;
};



/**
 * Setting the relative position of the recommendation related to the collection
 * The collection's rotation gets added to this point here
 * @param {float} x
 * @param {float} y
 * @param {float} z
 */
GLVIS.Recommendation.prototype.setRelativePosition = function (x, y, z) {

    if (x === null || x === undefined)
        x = this.vis_data_.relative_position.x;
    if (y === null || y === undefined)
        y = this.vis_data_.relative_position.y;
    if (z === null || z === undefined)
        z = this.vis_data_.relative_position.z;

    /*
     * 
     * Not necessary anymore. Rotation made out of the box by mesh
     * 
     var rotated = new THREE.Vector3(x, y, z);
     
     var y_rotate = this.getCollection() ? this.getCollection().getRotation() : 0;
     if (parseFloat(y_rotate) !== 0.0) {
     var vec = new THREE.Vector3(x, y, z);
     rotated = GLVIS.Tools.getRotation(2, y_rotate, vec);
     }
     
     this.vis_data_.relative_position.x = rotated.x;
     this.vis_data_.relative_position.y = rotated.y;
     this.vis_data_.relative_position.z = rotated.z;
     */
    this.vis_data_.relative_position.x = x;
    this.vis_data_.relative_position.y = y;
    this.vis_data_.relative_position.z = z;

    //Force redraw of node
    this.setIsDirty(true);
};

/**
 * Set the position by a radians value.
 * Necessary for animation. The "that" parameter is necessary as it is used as
 * registered function in the animation without any knowlege about the object.
 * @param{GLVIS.Recommendation | null} that Reference to THIS object. (Animation doesn't know me...)
 * @param {float} rad Radians
 */
GLVIS.Recommendation.prototype.setRelativePositionByRad = function (that, rad) {
    if (!that)
        that = this;

    var init_distance = GLVIS.config.collection.recommendation.init_distance;

    var node_type_secific_add_distance = this.vis_data_.gl_objects.center_node.add_distance;

    //this.updateNodeDistance();
    var distance = that.vis_data_.distance_factor * init_distance + node_type_secific_add_distance;
    var pos = GLVIS.Tools.getPosFromRad(rad, distance);
    that.setRelativePosition(pos.x, pos.y, GLVIS.config.collection.recommendation.init_z);
};

/**
 * Get the radians of the node around the collection.
 * Necessary for animation. The "that" parameter is necessary as it is used as
 * ŕegistered function in the animation without any knowlege about the object.
 * @param{GLVIS.Recommendation | null} that Reference to THIS object. (Animation doesn't know me...)
 * @returns {float} Radians
 */
GLVIS.Recommendation.prototype.getRelativePositionRad = function (that) {
    if (!that)
        that = this;

    var distance = GLVIS.config.collection.recommendation.init_distance;


    var pos = that.getRelativePosition();

    return GLVIS.Tools.getRadFromPos(pos.x, pos.y);

};

/**
 * Visualizing the stored relevance e.g. by size or distance or resetting it
 * @param {bool} visualize If TRUE relevance gets visualized else not.
 * @returns {undefined}
 */
GLVIS.Recommendation.prototype.toggleVisualizeRelevance = function (visualize) {

    GLVIS.Debugger.debug("Recommendation", "Toggle rel vis of rec " + this.getId() + " called ", 7);
    if (visualize) {
        var relevance = this.getRelevance();

        var config = GLVIS.config.collection.recommendation.relevance;

        this.setSizeFactor(relevance * config.sizefactor + config.sizeoffset, true);
    }
    else {
        var config = GLVIS.config.collection.recommendation;
        GLVIS.Scene.getCurrentScene().getAnimation().finishAnimation(config.size_animation.id_prefix + this.getId());
        GLVIS.Scene.getCurrentScene().getAnimation().finishAnimation(config.distfact_animation.id_prefix + this.getId());
        this.setSizeFactor(1, false);
    }

    this.vis_data_.relevance_shown = visualize;
    this.updateNodeDistance();
};

/**
 * @param {float} factor Factor to be multiplied with radius
 * @param {bool} animate TRUE if animation should be performed
 */
GLVIS.Recommendation.prototype.setSizeFactor = function (factor, animate) {

    GLVIS.Debugger.debug("Recommendation", "Setting size factor of rec " + this.getId() + " to " + factor, 7);
    if (!animate) {
        this.vis_data_.size_factor = factor;
        this.setIsDirty(true);
    }
    else {

        var config = GLVIS.config.collection.recommendation.size_animation;
        GLVIS.Scene.getCurrentScene().getAnimation().register(
                config.id_prefix + this.getId(),
                factor,
                null,
                this.getSizeFactor.bind(this),
                this.setSizeFactor.bind(this),
                0,
                config.speed,
                config.pow,
                config.threshold,
                function () {
                    //Ready animation
                },
                true
                );
    }
};

/**
 * A value that represents a 'relevance' of the current rec in the collection 
 * @param {float} relevance A Value between 0 and 1
 */
GLVIS.Recommendation.prototype.setRelevance = function (relevance) {

    if (relevance < 0 || relevance > 1)
        throw ("Relevance must be between 0 and 1");

    this.vis_data_.relevance = relevance;
};

/**
 * A value that represents a 'relevance' of the current rec in the collection 
 * @returns {float} The 'relevance' value of the rec
 */
GLVIS.Recommendation.prototype.getRelevance = function () {
    return this.vis_data_.relevance;
};

/**
 * @return {float} Factor to be multiplied with radius
 */
GLVIS.Recommendation.prototype.getSizeFactor = function () {
    return this.vis_data_.size_factor;
};



GLVIS.Recommendation.prototype.setRadius = function (radius) {
    if (this.vis_data_.radius === radius)
        return;
    this.vis_data_.radius = radius;
    this.setIsDirty(true);
};

GLVIS.Recommendation.prototype.getRadius = function () {
    return this.vis_data_.radius;
};


/**
 * Setting a factor for moving the rec more far or near relative to the collection center
 * @param {float} factor
 * @param {bool} animate TRUE if animation should be started, FALSE if not
 */
GLVIS.Recommendation.prototype.setDistanceFactor = function (factor, animate) {

    GLVIS.Debugger.debug("Recommendation", "Setting distance factor of rec " + this.getId() + " to " + factor, 7);
    if (!animate) {
        this.vis_data_.distance_factor = factor;
        this.setRelativePositionByRad(this, this.getRelativePositionRad());

    }
    else {

        var config = GLVIS.config.collection.recommendation.distfact_animation;

        GLVIS.Scene.getCurrentScene().getAnimation().register(
                config.id_prefix + this.getId(),
                factor,
                null,
                this.getDistanceFactor.bind(this),
                this.setDistanceFactor.bind(this),
                0,
                config.speed,
                config.pow,
                config.threshold,
                function () {
                    //Ready animation
                },
                true
                );
    }
},
        /**
         * Getting a factor for moving the rec more far or near relative to the collection center
         * return {float}
         */
        GLVIS.Recommendation.prototype.getDistanceFactor = function () {
            return this.vis_data_.distance_factor;
        },
        /**
         * 
         * @param {integer} color e.g. 0xFF0000
         */
        GLVIS.Recommendation.prototype.setColor = function (color) {
            if (this.vis_data_.color === color)
                return;
            this.vis_data_.color = color;
            this.setIsDirty(true);
        };

/**
 * @param {float} opacity 0 - Transparent, 1 - Full visible
 * @param {bool} animate TRUE if animation, FALSE if not
 */
GLVIS.Recommendation.prototype.setOpacity = function (opacity, animate) {
    if (this.vis_data_.opacity === opacity)
        return;

    if (!animate) {
        this.vis_data_.opacity = opacity;
        this.setIsDirty(true);
    }
    else {

        var config = GLVIS.config.collection.recommendation.opacity_animation;
        GLVIS.Scene.getCurrentScene().getAnimation().register(
                config.id_prefix + this.getId(),
                opacity,
                null,
                this.getOpacity.bind(this),
                this.setOpacity.bind(this),
                0,
                config.speed,
                config.pow,
                config.threshold,
                function () {
                    //Ready animation
                },
                true
                );
    }
};

/**
 * Apply a positive or negative match of the filter's result to visualize that.
 * @param {bool} positive
 */
GLVIS.Recommendation.prototype.setFilterPositive = function (positive) {

    if (this.vis_data_.is_filter_positive === positive)
        return;

    //Only animate if current collection selected
    var animate = this.getCollection().getStatus() === GLVIS.Collection.STATUSFLAGS.SELECTED ? true : false;
    if (positive) {
        this.setOpacity(1, animate);
        //this.setDistanceFactor(1, animate);
    }
    else {
        this.setOpacity(0.3, animate);
        //this.setDistanceFactor(0.9, animate);
    }



    this.vis_data_.is_filter_positive = positive;

    //Include relevance in distance of nodes
    /*
     var relevance = this.getRelevance();
     
     var filter_distance_fact = positive ? 1 : GLVIS.config.collection.recommendation.filter.distance_factor;
     var dist_fact = GLVIS.config.collection.recommendation.relevance.distfactor;
     
     if (this.vis_data_.relevance_shown)
     this.setDistanceFactor((1 + relevance * dist_fact) * filter_distance_fact, true);
     else
     this.setDistanceFactor(1 * filter_distance_fact, true);
     */

    this.updateNodeDistance();
    this.setIsDirty(true);
};

GLVIS.Recommendation.prototype.updateNodeDistance = function () {
    var relevance = this.getRelevance();
    var filter_positive = this.vis_data_.is_filter_positive;

    var filter_distance_fact = filter_positive ? 1 : GLVIS.config.collection.recommendation.filter.distance_factor;
    var dist_fact = GLVIS.config.collection.recommendation.relevance.distfactor;

    var dist_config = GLVIS.config.collection.recommendation.distance;

    var goal_fact;
    var min_dist = dist_config.min_dist_fct;
    var max_dist = dist_config.max_dist_fct;

    if (this.vis_data_.relevance_shown)
        goal_fact = dist_config.rel_offset + (dist_config.filter_offset + relevance * dist_fact) * filter_distance_fact;
    else
        goal_fact = 1 * filter_distance_fact;

    //Set min and max distance factor
    goal_fact = Math.max(goal_fact, min_dist);
    goal_fact = Math.min(goal_fact, max_dist);

    var animate = false;
    if (this.getCollection().getRingRepresentation())
        animate = true;

    if (this.getDistanceFactor() !== goal_fact)
        this.setDistanceFactor(goal_fact, animate);
};

/**
 * TRUE if applied filters are positive (not filtered out)
 * Else FALSE
 * @returns {bool}
 */
GLVIS.Recommendation.prototype.getFilterPositive = function () {
    return this.vis_data_.is_filter_positive;
};


GLVIS.Recommendation.prototype.getOpacity = function (/* include_distance */) {

    var depth_opacity_fact = 1;
    /*
     var depth_strength = GLVIS.config.collection.recommendation.opacity_depth.strength;
     var depth_weaken = GLVIS.config.collection.recommendation.opacity_depth.weakness;
     if (include_distance) {
     depth_opacity_fact = Math.min(1, (1 - this.getPosition().z * depth_strength)) * depth_weaken + (1 - depth_weaken);
     }
     
     console.log("OPACITY: ", this.getPosition().z);
     */
    return this.vis_data_.opacity;
};


GLVIS.Recommendation.prototype.getColor = function () {
    return this.vis_data_.color;
};

GLVIS.Recommendation.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
    if (dirty) {
        this.setMyGlObjectsDirty_();
    }
};

GLVIS.Recommendation.prototype.getId = function () {
    return this.id_;
};

GLVIS.Recommendation.prototype.getEexcessData = function () {
    return this.eexcess_data_;
};

GLVIS.Recommendation.prototype.openLink = function () {

    var win = window.open(this.eexcess_data_.result.uri, '_blank');
};


/******************
 * 
 * STATIC FUNCTIONS
 * 
 ******************/


GLVIS.Recommendation.current_id = 0;
GLVIS.Recommendation.getNewId = function () {
    var id = this.current_id;
    this.current_id++;
    return id;
};
GLVIS.Recommendation.STATUSFLAGS = {
    NORMAL: 0x000,
    HIDDEN: 0x001
};

GLVIS.Recommendation.NODETYPES = {
    COMMON: GLVIS.RecommendationCommonNode,
    DETAILED: GLVIS.RecommendationDetailNode
};


GLVIS.Recommendation.COLORDATA = {
    PROVIDER: "provider",
    LANGUAGE: "language"
};

GLVIS.Recommendation.current_selected_rec = null;