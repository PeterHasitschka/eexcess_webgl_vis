

var IQHN = IQHN || {};

/**
 * 
 * Object representing and visualizing a search-query from the database
 * or a saved collection in the rec-dashboard* 
 * 
 * @param {type} eexcess_data @TODO Define data structure
 */
IQHN.Collection = function (eexcess_data) {

    /**
     * Internal increment id
     */
    this.id_ = IQHN.Collection.getNewId();

    /**
     * @type {IQHN.Collection.id_}
     */
    this.parent_id_ = null;

    /**
     * Data like search-query, timestamp
     */
    this.eexcess_data_ = eexcess_data;

    /**
     * True if collection changed and needs to be re-rendered
     */
    this.dirty_ = true;

    /**
     * Everything related to visualization
     */
    this.vis_data_ = {
        status: IQHN.Collection.STATUSFLAGS.NORMAL,
        //Position is stuff that belongs to the collection and not in the node.
        //Because several visual repr. should be able to use it
        position: {
            x: 0,
            y: 0,
            z: IQHN.config.collection.center_node.circle.z_value
        },
        init_pos: null,
        rotation_degree: 0.0,
        init_rotation_degree: null,
        gl_objects: {
            center_node: null,
            parent_connection: null,
            plane: null,
            compare_bar: null
        },
        mesh_container: null,
        is_currently_animated: false,
        rec_relevances_vis: false
    };

    /**
     * Connections to other objects (e.g parent-collection)
     */
    this.connections_ = {
        to_collection: []
    };

    /**
     * Holding all recommendations from the query / collection
     */
    this.recommendations_ = [];

    /** @type{Array} holding @see{IQHN.Text} Objects **/
    this.labels_ = [];

    /**
     * Created freshly when needed
     * @type {IQHN.RingRepresentation}
     */
    this.ring_representation_ = null;

    /**
     * Created when needed
     * @type {IQHN.HighlightRecsByLabel}
     */
    this.highlight_recs_by_label_ = null;

    /**
     * Handles the positions of the recommendations
     * @type{IQHN.RecommendationPosDistributed} 
     */
    this.recommendation_position_handler_ = new IQHN.RecommendationPosDistributed(this);

    this.initGlNode();
    this.initLabels();

    IQHN.Debugger.debug("Collection",
            "Collection with id " + this.id_ + " created!",
            5);
};



/**
 * 
 * @param {IQHN.Recommendation} recommendation Recommendation object to add
 */
IQHN.Collection.prototype.addRecommendation = function (recommendation) {
    recommendation.setCollection(this);
    this.recommendations_.push(recommendation);

    this.recommendation_position_handler_.calculatePositions();
};

/**
 * 
 * @param {IQHN.RecommendationPosDistributed | IQHN.RecommendationPosRingRepresentation} pos_handler Some type of position handler
 */
IQHN.Collection.prototype.setRecPosHandler = function (pos_handler) {
    this.recommendation_position_handler_ = pos_handler;
};

/**
 * Returns Recommendation position handler
 * @returns {IQHN.RecommendationPosDistributed | IQHN.RecommendationPosRingRepresentation}
 */
IQHN.Collection.prototype.getRecPosHandler = function () {
    return this.recommendation_position_handler_;
};

/**
 * Creating a node in the center of the collection
 * @returns {undefined}
 */
IQHN.Collection.prototype.initGlNode = function () {

    //Create mesh-container and add it to the scene
    var container = new THREE.Object3D();
    this.vis_data_.mesh_container = container;
    IQHN.Scene.getCurrentScene().getWebGlHandler().getThreeScene().add(container);

    //Create center node
    var gl_node = new IQHN.CollectionCenterNode(this, container);
    this.vis_data_.gl_objects.center_node = gl_node;

    //Create plane
    var plane = new IQHN.CollectionPlane(this, container);
    this.vis_data_.gl_objects.plane = plane;

};

/**
 * Returns the mesh-container holding all webgl-objects
 * @returns {THREE.Object3D}
 */
IQHN.Collection.prototype.getMeshContainerNode = function () {
    return this.vis_data_.mesh_container;
};

/**
 * Initializing the collection's label
 */
IQHN.Collection.prototype.initLabels = function () {

    var config = IQHN.config.collection.labels;
    var init_font_size = config.init_font_size;

    var text = "Collection #" + this.getId();

    var text_element = new IQHN.Text(text, {
        font_size: init_font_size,
        color: config.title_color,
        opacity: config.init_opacity
    },
    null, null, null, null, this);

    this.labels_.push(text_element);

    if (this.eexcess_data_) {


        _.each(this.eexcess_data_.query, function (curr_q_data) {
            var text = curr_q_data.text;
            if (!text.length)
                return;

            var weight = typeof curr_q_data.weight !== "undefined" ? curr_q_data.weight : 1;

            var fontsize = init_font_size * Math.pow(weight, 0.5);
            fontsize = Math.min(config.max_font_size, fontsize);
            fontsize = Math.max(config.min_font_size, fontsize);

            var opacity = config.init_opacity * weight * Math.pow(weight, 0.5);

            opacity = Math.min(config.max_opacity, opacity);
            opacity = Math.max(config.min_opacity, opacity);

            /**
             * Function called in Label when mouse-overed.
             * For highlighting recs by label
             * @param {type} text Inserted by label
             * @param {type} data see mouse_data
             */
            var mouse_over_fct = function (text, data) {

                /** @type{IQHN.Collection} **/
                var collection = data.collection;
                var highlighter = collection.getHighlightRecsByLabel();


                if (highlighter.getCurrentHighlightedLabel() === text.getText())
                    return;
                else if (highlighter.getCurrentHighlightedLabel())
                    highlighter.unHighlight();

                highlighter.highlight(text);
            };

            /**
             * Function called in Label when mouse left.
             * For unhighlighting recs by label
             * @param {type} text Inserted by label
             * @param {type} data see mouse_data
             */
            var mouse_leave_fct = function (text, data) {
                /** @type{IQHN.Collection} **/
                var collection = data.collection;
                var highlighter = collection.getHighlightRecsByLabel();

                if (highlighter.getCurrentHighlightedLabel() === text.getText())
                    highlighter.unHighlight();
            };

            var mouse_data = {
                collection: this
            };

            var text_element = new IQHN.Text(
                    text,
                    {font_size: fontsize, opacity: opacity},
            {color: config.highlight_color},
            mouse_over_fct,
                    mouse_leave_fct,
                    mouse_data,
                    this
                    );

            this.labels_.push(text_element);
        }.bind(this));
    }
    this.rebuildLabelPositions();
};

/**
 * Render the collection and its sub-objects
 */
IQHN.Collection.prototype.preRender = function () {

    if (!this.dirty_)
        return;

    IQHN.Debugger.debug("Collection",
            "Collection with id " + this.id_ + " rendered!",
            6);

    //Render all Gl-Objects
    for (var key in this.vis_data_.gl_objects) {
        if (this.vis_data_.gl_objects.hasOwnProperty(key)) {
            if (this.vis_data_.gl_objects[key])
                this.vis_data_.gl_objects[key].preRender();
        }
    }

    var pos = this.getPosition();
    var z_pos = IQHN.config.collection.center_node.circle.z_value;
    this.vis_data_.mesh_container.position.set(
            pos.x,
            pos.y,
            pos.z
            );

    //Render all recommendations
    for (var i = 0; i < this.recommendations_.length; i++) {
        /** @type {IQHN.Recommendation} **/
        var curr_rec = this.recommendations_[i];
        curr_rec.preRender();
    }

    //If Ring representation -> render it.
    if (this.ring_representation_)
        this.ring_representation_.preRender();


    //Render labels
    for (var i = 0; i < this.labels_.length; i++) {
        this.labels_[i].preRender();
    }

    this.dirty_ = false;
};

/**
 * Called by interactionhandler. Function registered in mesh-objects
 */
IQHN.Collection.prototype.handleCenterClick = function () {

};

/**
 * Called by interactionhandler. Function registered in mesh-objects
 */
IQHN.Collection.prototype.handleClick = function () {
    if (this.getStatus() === IQHN.Collection.STATUSFLAGS.HIDDEN)
        return;

    IQHN.Debugger.debug("Collection",
            "Collection " + this.getId() + " CLICKED!",
            3);

    IQHN.Debugger.debug("Collection",
            this,
            5);

    //this.deleteRingRepresentation();
    if (!this.ring_representation_)
        this.createRingRepresentation();
};

/**
 * Called by interactionhandler. Function registered in mesh-objects
 */
IQHN.Collection.prototype.handleCenterMouseover = function () {

    if (!this.vis_data_.is_currently_animated)
        this.connectSameRecsFromOtherCollections();
    else
        this.unconnectSameRecsFromOtherCollections();
};

/**
 * May be called by interactionhandler. Function registered in mesh-objects
 */
IQHN.Collection.prototype.handleMouseover = function () {

    //Do nothing at the moment...
};

/**
 * Create connections from own recommendations to those which are the same in 
 * other collections
 */
IQHN.Collection.prototype.connectSameRecsFromOtherCollections = function () {

    /*
     * If allready existing, skip
     */
    if (_.indexOf(IQHN.RecConnector.activatedAtCollections, this) !== -1) {
        return;
    }

    var connector = IQHN.Scene.getCurrentScene().getRecConnector();

    _.each(this.getRecommendations(), function (rec) {
        connector.connectSameRecs(rec);
    });

    IQHN.RecConnector.activatedAtCollections.push(this);
};

/**
 * Remove all connections from own recommendation to their twins in other collections
 */
IQHN.Collection.prototype.unconnectSameRecsFromOtherCollections = function () {

    if (_.indexOf(IQHN.RecConnector.activatedAtCollections, this) === -1) {
        return;
    }

    _.each(this.getRecommendations(), function (rec) {
        rec.deleteAllRecSplines();
    });

    var index_to_delete = _.indexOf(IQHN.RecConnector.activatedAtCollections, this);

    IQHN.RecConnector.activatedAtCollections.splice(index_to_delete, 1);
};

/**
 * Calls the @see{IQHN.NavigationHandler.focusCollection} function
 * to zoom and move to the collection.
 * Additionaly informs the Rec Dashboard Handler about the click
 * @param {function} cb Callback
 */
IQHN.Collection.prototype.selectAndFocus = function (cb) {
    //this.setStatus(IQHN.Collection.STATUSFLAGS.SELECTED);

    IQHN.Collection.curr_focus_coll = this;

    IQHN.Scene.getCurrentScene().getNavigationHandler().focusCollection(this, function () {
        IQHN.Debugger.debug("Collection",
                "FOCUSGRAPH: Callback finish!",
                3);
        if (cb)
            cb();
    }.bind(this));
    IQHN.Scene.getCurrentScene().getRecDashboardHandler().onCollectionClick(this);
};


/**
 * Rotate the collection that it faces directly another collection
 * @param {IQHN.Collection} coll
 * @param {bool} animate
 */
IQHN.Collection.prototype.lookAtCollection = function (goal_coll, animate) {

    var my_pos = this.getPosition();
    var my_vec = new THREE.Vector3(my_pos.x, my_pos.y, my_pos.z);

    var goal_pos = goal_coll.getPosition();

    var goal_vec = new THREE.Vector3(goal_pos.x, goal_pos.y, goal_pos.z);

    var dir_vec = goal_vec.clone();
    dir_vec.sub(my_vec);

    var rad = Math.atan2(dir_vec.x, dir_vec.z);
    var degree = (rad * (180 / Math.PI));

    this.setRotation(degree, animate);
};

/**
 * Reset the collection's rotation to the initial value
 * @param {bool} animate
 */
IQHN.Collection.prototype.resetLookAt = function (animate) {
    if (this.vis_data_.init_rotation_degree === null)
        throw ("Could not reset Rotation. No init value set!");
    this.setRotation(this.vis_data_.init_rotation_degree, animate);
};

/**
 * Just moving the camera back a little bit
 * Be sure to call this only if no other collection gets selected at the same time! (Conflicts!)
 */
IQHN.Collection.prototype.deselect = function () {
    IQHN.Scene.getCurrentScene().getNavigationHandler().defocusCollection();
    IQHN.Collection.curr_focus_coll = null;
};

/**
 * Setting all Objects holding GL Objects dirty
 */
IQHN.Collection.prototype.setMyGlObjectsDirty_ = function () {
    for (var key in this.vis_data_.gl_objects) {
        if (this.vis_data_.gl_objects.hasOwnProperty(key)) {
            if (this.vis_data_.gl_objects[key])
                this.vis_data_.gl_objects[key].setIsDirty(true);
        }
    }
};

/**
 * Return all renderable objects that contain gl-related stuff
 * @returns {object}
 */
IQHN.Collection.prototype.getGlObjects = function () {

    return this.vis_data_.gl_objects;
};

IQHN.Collection.prototype.getId = function () {
    return this.id_;
};

IQHN.Collection.prototype.getPosition = function () {
    return this.vis_data_.position;
};

/**
 * Set the coordinates of the collection.
 * If changed several other sub-objects (labels) get affected
 * If one parameter is null or undefined it gets ignored
 * @param {float} x
 * @param {float} y
 * @param {float} z
 */
IQHN.Collection.prototype.setPosition = function (x, y, z) {
    if (x !== undefined && x !== null)
        this.vis_data_.position.x = x;

    if (y !== undefined && y !== null)
        this.vis_data_.position.y = y;

    if (z !== undefined && z !== null)
        this.vis_data_.position.z = z;

    this.rebuildLabelPositions();

    this.setIsDirty(true);
    this.setMyGlObjectsDirty_();
};

/**
 * used for animation
 * @param {object} pos containing x,y,z
 */
IQHN.Collection.prototype.setPositionObj = function (pos) {
    this.setPosition(pos.x, pos.y, pos.z);
};

/**
 * After changing the absolute position of the collection, the labels that only
 * hold absolute positions too, need new x and y values.
 * @returns {undefined}
 */
IQHN.Collection.prototype.rebuildLabelPositions = function () {

    IQHN.Debugger.debug("Collection", "Rebuilding Text positions", 7);

    if (!this.labels_.length)
        return;

    var config = IQHN.config.collection.labels;
    var vert_dist = config.distance;

    var vert_offset = config.vertical_offset;

    var title_label = this.labels_[0];
    title_label.setPosition(config.title_pos_x, config.title_pos_y, 0);

    var c_x = config.kws_pos_x;

    for (var i = 1; i < this.labels_.length; i++) {

        var c_y = config.kws_pos_start_y - vert_dist * (i - 1);

        var curr_label = this.labels_[i];
        curr_label.setPosition(c_x, c_y, 0);
    }



    /**
     * Old style with labels and title on top in columns
     */

    // -1 due to seperate treating of title label
    /*
     var c_x_start = 0 - (((config.columns - 1) / 2) * config.column_distance);
     var elements_per_col = Math.round((this.labels_.length) / config.columns);
     for (var c_count = 0; c_count < config.columns; c_count++) {
     
     var c_x = c_x_start + c_count * config.column_distance;
     
     for (var r_count = 0; r_count < elements_per_col; r_count++) {
     
     var c_y = (r_count + 1) * vert_dist + vert_offset;
     
     var label_index = c_count * elements_per_col + r_count + 1;
     if (label_index >= this.labels_.length)
     break;
     
     /** @type {IQHN.Text} /
     var curr_label = this.labels_[label_index];
     curr_label.setPosition(c_x, c_y, 0);
     }
     }
     */
};

/**
 * Get all recommendations holded by the collection
 * @returns {IQHN.Collection.recommendations_}
 */
IQHN.Collection.prototype.getRecommendations = function () {
    return this.recommendations_;
};


IQHN.Collection.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
};

/**
 * Set the status of the collection.
 * See @see{IQHN.Collection.STATUSFLAGS}
 * @param {type} status
 * @returns {undefined}
 */
IQHN.Collection.prototype.setStatus = function (status) {

    if (status === this.vis_data_.status)
        return;

    this.vis_data_.status = status;

    this.dirty_ = true;
    //Status change also means change of visual representation
    this.setMyGlObjectsDirty_();

};

/**
 * Returning the current status
 * Available flags: @see{IQHN.Collection.STATUSFLAG}
 * @returns {integer}
 */
IQHN.Collection.prototype.getStatus = function () {
    return this.vis_data_.status;
};

/**
 * Setting the id of the parent-collection
 * @param {integer} parent_id
 */
IQHN.Collection.prototype.setParentId = function (parent_id) {
    this.parent_id_ = parent_id;
};

/**
 * Resets the connection to the parent-collection. Necessary after initializing
 * all nodes and on possible change of collection-network
 * @returns {undefined}
 */
IQHN.Collection.prototype.updateParentConnection = function () {
    //Set Parent Connection
    if (this.parent_id_ !== null) {
        var parent_collection = IQHN.Scene.getCurrentScene().getCollection(this.parent_id_);

        if (parent_collection)
        {
            IQHN.Debugger.debug("Collection",
                    "parent collection found. Creating connection",
                    8);

            var parent_connection = new IQHN.ConnectionCollectionCollection(parent_collection, this);
            this.vis_data_.gl_objects.parent_connection = parent_connection;
            this.dirty_ = true;
        }
        else
            throw("PARENT COLLECTION WITH ID " + this.parent_id_ + " NOT FOUND");
    }
};

/**
 * Creating a @see{IQHN.RingRepresentation} object.
 * It shows several data of the collection and recommendations as rings inside
 * the graph.
 * @param {function} cb Callback
 */
IQHN.Collection.prototype.createRingRepresentation = function (cb) {

    this.selectAndFocus();

    IQHN.Scene.getCurrentScene().getCollectionPositionHandler().moveCollectionFromCenter(this, function () {
    });

    this.resetLookAt(true);
    /**
     * Remove all other ringreps
     * @param {IQHN.Collection} coll
     */
    _.each(IQHN.Scene.getCurrentScene().getCollections(), function (coll) {
        if (coll.getId() === this.getId())
            return;
        coll.deleteRingRepresentation(false);
        coll.lookAtCollection(this, true);
    }.bind(this));

    /**
     * Create Flipbook
     * @type {IQHN.CollectionPosLinear} pos_handler
     */
    var pos_handler = IQHN.Scene.getCurrentScene().getCollectionPositionHandler();
    pos_handler.setCollToFocus(this);
    pos_handler.setIsOneFocused(true);


    this.setStatus(IQHN.Collection.STATUSFLAGS.SELECTED);

    this.unconnectSameRecsFromOtherCollections();


    this.ring_representation_ = new IQHN.RingRepresentation(this);
    this.setRecPosHandler(new IQHN.RecommendationPosRingRepresentation(this));

    this.vis_data_.is_currently_animated = true;

    var recs = this.getRecommendations();

    for (var i = 0; i < recs.length; i++) {
        /** @type {IQHN.Recommendation} */
        var curr_rec = recs[i];
        curr_rec.setNodeType(IQHN.Recommendation.NODETYPES.DETAILED);
    }

    this.getRecPosHandler().calculatePositions(
            function () {
                this.vis_data_.is_currently_animated = false;



                if (cb)
                    cb();


            }.bind(this)
            );
    this.toggleRecRelevanceVisualization(true);


};

/**
 * Deleting the ring representation and all its segments etc.
 * Finally the Distributed Position Handler replaces the Ring Position Handler
 * for re-distributing the recommendation nodes around the collection
 * @param {bool} deselect Set to false if another collection gets focused! (Conflict!)
 */
IQHN.Collection.prototype.deleteRingRepresentation = function (deselect) {

    IQHN.Debugger.debug("Collection", "Deleting Ring Rep of Coll " + this.getId(), 5);

    if (!this.ring_representation_)
        return;

    this.ring_representation_.delete();
    this.ring_representation_ = null;

    this.toggleRecRelevanceVisualization(false);

    //Prevent registered callback of ring-rep-pos-handler to be performed
    if (this.getRecPosHandler() instanceof IQHN.RecommendationPosRingRepresentation)
        this.getRecPosHandler().deleteCallback();

    this.setRecPosHandler(new IQHN.RecommendationPosDistributed(this));


    var recs = this.getRecommendations();

    for (var i = 0; i < recs.length; i++) {
        /** @type {IQHN.Recommendation} */
        var curr_rec = recs[i];
        curr_rec.setNodeType(IQHN.Recommendation.NODETYPES.COMMON);
    }
    this.getRecPosHandler().calculatePositions();

    IQHN.Scene.getCurrentScene().getCollectionPositionHandler().moveCollectionToCenter(this);
    this.setStatus(IQHN.Collection.STATUSFLAGS.NORMAL);
    if (deselect) {
        this.deselect();
        for (var i = 0; i < IQHN.Scene.getCurrentScene().getCollections().length; i++) {
            IQHN.Scene.getCurrentScene().getCollections()[i].resetLookAt(true);
        }
    }

};

/**
 * Showing the recommendations relevances or resetting it
 * @param {float} visualize TRUE if relevance should be visualized else FALSE
 */
IQHN.Collection.prototype.toggleRecRelevanceVisualization = function (visualize) {

    if (this.vis_data_.rec_relevances_vis === visualize)
        return;

    this.vis_data_.rec_relevances_vis = visualize;

    IQHN.Debugger.debug("IQHN.Collection", "Toggling rec-relevance-visualization of (" + this.getId() + ") to " + visualize, 5);
    var recs = this.getRecommendations();
    for (var i = 0; i < recs.length; i++) {
        /** @type {IQHN.Recommendation} **/
        var curr_rec = recs[i];
        curr_rec.toggleVisualizeRelevance(visualize);
    }
};

IQHN.Collection.prototype.hideLabels = function () {

    for (var i = 0; i < this.labels_.length; i++) {
        this.labels_[i].setIsVisible(false);
    }
};

IQHN.Collection.prototype.showLabels = function () {

    for (var i = 0; i < this.labels_.length; i++) {
        this.labels_[i].setIsVisible(true);
    }
};

/**
 * Returning the parent-collection's id
 * @returns {integer}
 */
IQHN.Collection.prototype.getParentId = function () {
    return this.parent_id_;
};

/**
 * 
 * @returns {IQHN.RingRepresentation}
 */
IQHN.Collection.prototype.getRingRepresentation = function () {
    return this.ring_representation_;
};

/**
 * Returns the Highlighter for recs by label
 * @returns {IQHN.HighlightRecsByLabel}
 */
IQHN.Collection.prototype.getHighlightRecsByLabel = function () {
    if (!this.highlight_recs_by_label_)
        this.highlight_recs_by_label_ = new IQHN.HighlightRecsByLabel(this);

    return this.highlight_recs_by_label_;
};


/**
 * Setting the degree of rotation around the y-axis of the collection
 * If animate flag is set: Animation gets registered
 * @param {float} degree
 * @param {boolean} animate Animate Rotation
 */
IQHN.Collection.prototype.setRotation = function (degree, animate) {


    //Normalize degree
    /*
     * REMOVED: Disturbs short-way algorithm (see below)
     while (degree < 0)
     degree += 360;
     degree = degree % 360;
     */

    if (this.vis_data_.init_rotation_degree === null)
        this.vis_data_.init_rotation_degree = degree;

    if (degree === this.vis_data_.rotation_degree)
        return;

    var rotate_config = IQHN.config.collection.rotation;
    if (animate) {



        var degree_input = degree;
        //Check for shortest way

        var curr_degr = this.getRotation();
        var way_normal_l = Math.abs(curr_degr - degree);
        var way_forward_l = Math.abs(curr_degr - (degree + 360));
        var way_backward_l = Math.abs((curr_degr + 360) - degree);

        var min_way = Math.min(way_normal_l, way_forward_l, way_backward_l);

        //Prevent to return back if over 360-gap is shorter
        if (min_way === way_forward_l) {
            degree += 360;
        }
        //Prevent going around the circle if going back over 0 would be shorter
        else if (min_way === way_backward_l) {
            this.setRotation(curr_degr + 360, false);
        }

        this.vis_data_.is_currently_animated = true;
        IQHN.Scene.getCurrentScene().getAnimation().register(
                rotate_config.prefix + this.getId(),
                degree,
                null,
                this.getRotation.bind(this),
                this.setRotation.bind(this),
                0,
                rotate_config.speed,
                rotate_config.pow,
                rotate_config.threshold,
                function () {
                    IQHN.Debugger.debug("Collection", "Finished rotation", 5);
                    this.vis_data_.is_currently_animated = false;

                    //If way_forward manipulation -> Reset degree
                    if (degree !== degree_input)
                        this.setRotation(degree_input, false);

                }.bind(this),
                true
                );
        return;
    }


    /**
     * Rotate mesh container
     */
    var meshcontainer = this.getMeshContainerNode();
    var box = new THREE.Box3().setFromObject(meshcontainer);
    var x_center = box.min.x + (box.max.x - box.min.x) / 2.0;

    var degree_diff = degree - this.vis_data_.rotation_degree;
    var rad = degree_diff * Math.PI / 180;
    meshcontainer.applyMatrix(new THREE.Matrix4().makeTranslation(-x_center, 0, 0));
    meshcontainer.applyMatrix(new THREE.Matrix4().makeRotationY(rad));
    meshcontainer.applyMatrix(new THREE.Matrix4().makeTranslation(x_center, 0, 0));

    this.vis_data_.rotation_degree = degree;
    this.setIsDirty(true);
};

/**
 * Return the current degree of rotation around the y-axis
 * @returns {float}
 */
IQHN.Collection.prototype.getRotation = function () {
    return this.vis_data_.rotation_degree;
};

/**
 * Set the initial position for restoring later
 * @param {object} pos containing x,y,z 
 */
IQHN.Collection.prototype.setInitPos = function (pos) {
    this.vis_data_.init_pos = pos;
};

/**
 * Get the stored intial position
 * @returns {object} containing x,y,z
 */
IQHN.Collection.prototype.getInitPos = function () {
    return this.vis_data_.init_pos;
};

IQHN.Collection.prototype.cleanup = function () {
    
};


/******************
 * 
 * STATIC FUNCTIONS
 * 
 ******************/


IQHN.Collection.current_id = 0;
IQHN.Collection.getNewId = function () {
    var id = this.current_id;
    this.current_id++;
    return id;
};


IQHN.Collection.STATUSFLAGS = {
    NORMAL: 0x000,
    HIDDEN: 0x001,
    SELECTED: 0x002
};

// Current focused coll
IQHN.Collection.curr_focus_coll = null;