
var IQHN = IQHN || {};



IQHN.InteractionHandler = function (scene) {


    /** @var {IQHN.Scene} **/
    this.scene_ = scene;

    var config = IQHN.config.interaction;
    var nh = this.scene_.getNavigationHandler();


    var ks = config.key_step;
    this.keyinteractions_ = {
        keydown: {
            37: function () {   // LEFT
                nh.moveCameraAroundCircle(-ks, 0, true);
            }.bind(this),
            39: function () {   // RIGHT
                nh.moveCameraAroundCircle(ks, 0, true);
            }.bind(this),
            38: function () {   // UP
                nh.moveCameraAroundCircle(0, ks, true);
            }.bind(this),
            40: function () {   // DOWN
                nh.moveCameraAroundCircle(0, -ks, true);
            }.bind(this)
        }
    };

    this.events_ = {
        mc: null,
        md: null
    };

    this.raycaster_ = new THREE.Raycaster();
    this.raycaster_.precision = config.raycaster_precision;

    this.mouse_ = new THREE.Vector2();

    var canvas = this.scene_.getWebGlHandler().getCanvas();



    this.evt_keydown = function (e) {
        this.handleKeyClick(e);
    }.bind(this);

    this.evt_canvas_mouseclick = function (e) {
        this.events_.mc = e;
        this.handleInteraction_(e, "mouseclick");
    }.bind(this);


    this.is_mouse_down_in_canvas = false;
    this.mouse_x_prev = null;
    this.mouse_y_prev = null;

    this.evt_canvas_mousedown = function (e) {
        this.events_.md = e;
        this.is_mouse_down_in_canvas = true;
        this.mouse_x_prev = e.clientX;
        this.mouse_y_prev = e.clientY;
    }.bind(this);

    this.evt_mouseup = function (e) {
        this.is_mouse_down_in_canvas = false;
    }.bind(this);

    this.evt_mouseleave = function (e) {
        this.is_mouse_down_in_canvas = false;
    }.bind(this);

    this.evt_canvas_mousemove = function (e) {
        this.handleInteraction_(e, "mouseover");

        if (!this.is_mouse_down_in_canvas)
            return;

        var zoom_factor = 1 / nh.getZoomFactor();
        var curr_mouse_x_diff = 0 - (e.clientX - this.mouse_x_prev) * zoom_factor;
        var curr_mouse_y_diff = (e.clientY - this.mouse_y_prev) * zoom_factor;

        nh.resetAnimationMovement();

        var sensitivity_vals = config.mousesensitivy;

        var df = nh.getDistanceFactor();

        var max_df = null;
        for (var max_df_key in sensitivity_vals) {
            if (df <= max_df_key)
                max_df = max_df_key;
            else
                break;
        }

        var sensitivity = sensitivity_vals[max_df];
        nh.moveCameraAroundCircle(
                curr_mouse_x_diff / sensitivity,
                curr_mouse_y_diff / sensitivity,
                true
                );
        this.mouse_x_prev = e.clientX;
        this.mouse_y_prev = e.clientY;

    }.bind(this);

    this.evt_canvas_mousewheel = function (e) {
        nh.onMouseWheelMove(e, this.getIntersectedObjects_(e));
    }.bind(this);

    jQuery(document).ready(function () {

        //KEYDOWN
        jQuery(window).on("keydown", this.evt_keydown);

        //MOUSE-CLICK ON SCENE  
        jQuery(canvas).on("click", this.evt_canvas_mouseclick);

        //MOUSE-MOVE (DRAGGED)
        jQuery(canvas).on("mousedown", this.evt_canvas_mousedown);
        jQuery(window).on("mouseup", this.evt_mouseup);
        jQuery(window).on("mouseleave", this.evt_mouseleave);
        jQuery(canvas).on("mousemove", this.evt_canvas_mousemove);

        //MOUSE-WHEEL (ZOOM)
        jQuery(canvas).on("mousewheel", this.evt_canvas_mousewheel);
        
    }.bind(this));
};


/**
 * Calls interaction function on Three-Object if exists
 * @param {event} event 
 * @param {string} interaction_type e.g  'mouseclick', 'mouseover' ...
 */
IQHN.InteractionHandler.prototype.handleInteraction_ = function (event, interaction_type) {
    /*
     if (interaction_type === "mouseclick")
     this.deselectAllCollections();
     */

    var intersected = this.getIntersectedObjects_(event);

    IQHN.Debugger.debug("InteractionHandler",
            "HANDLING SCENE INTERACTION EVENT '" + interaction_type + "'", 6);

    var single_ids_already_clicked = [];

    //For flagging if some button was re-hovered
    IQHN.RecDetailNodeButton.new_hovered = false;


    for (var i = 0; i < intersected.length; i++) {
        var curr_intersect_obj = intersected[i].object;
        IQHN.Debugger.debug("InteractionHandler",
                ["Going through intersected object:", curr_intersect_obj], 9);

        if (curr_intersect_obj.interaction instanceof Object)
        {
            IQHN.Debugger.debug("InteractionHandler",
                    "...which is an Object", 9);
            if (
                    curr_intersect_obj.interaction[interaction_type] !== undefined &&
                    curr_intersect_obj.interaction[interaction_type] !== null
                    )
            {
                //Check if only-single-click allowed
                var i_id = curr_intersect_obj.interaction.interaction_id;
                var i_sc = curr_intersect_obj.interaction.interaction_singleclick_per_type;
                if (i_id) {
                    if (i_sc && i_sc === true) {
                        //If already in array, it was already clicked
                        if (single_ids_already_clicked.indexOf(i_id) > -1) {
                            continue;
                        }
                        single_ids_already_clicked.push(i_id);
                    }
                }



                IQHN.Debugger.debug("InteractionHandler",
                        "Intersected Object has following interaction-type: '" + interaction_type + "'", 8);
                curr_intersect_obj.interaction[interaction_type](curr_intersect_obj);

                //This flag prevents from executing any other interaction from this click
                if (curr_intersect_obj.interaction.interaction_singleclick_exclusive)
                    break;
            }
        }
    }

    //Unhovering button if not hovered again.
    if (!IQHN.RecDetailNodeButton.new_hovered && IQHN.RecDetailNodeButton.current_hovered) {
        IQHN.RecDetailNodeButton.current_hovered.unhover();
        IQHN.RecDetailNodeButton.current_hovered = null;
    }

    if (!intersected.length)
        this.handleEmptyClick(interaction_type);
};

/**
 * Handling clicks defined in constructor
 * @param {Event} e
 */
IQHN.InteractionHandler.prototype.handleKeyClick = function (e) {
    var is = this.keyinteractions_;

    IQHN.Debugger.debug("InteractionHandler", ["Key-Click", e.type, e.which], 7);

    var type_is = is[e.type];
    if (type_is === undefined)
        return;

    var key = e.which;
    if (type_is[key] === undefined)
        return;
    type_is[key]();
};

/**
 * Performing several deselections of no object was intersected
 * @param {String} interaction_type
 */
IQHN.InteractionHandler.prototype.handleEmptyClick = function (interaction_type) {

    /**
     * Unhighlighting last highlighted text if exists.
     */
    if (IQHN.Text.current_selected) {
        IQHN.Text.current_selected.handleMouseleave();
        IQHN.Text.current_selected = null;
    }



    /**
     * Remove rec-rec-splines when leaving objects with mouse
     */
    if (interaction_type === "mouseover") {
        _.each(IQHN.RecConnector.activatedAtCollections, function (coll) {

            if (!coll)
                return;
            coll.unconnectSameRecsFromOtherCollections();
        });

        _.each(IQHN.RecConnector.activatedAtSingleRecs, function (rec) {

            if (!rec)
                return;
            rec.deleteAllRecSplines();
        });
        IQHN.RecConnector.activatedAtSingleRecs = [];
    }
};

/**
 * Get Objects this are intersected
 * @param event Mouse over / down etc. event
 * @returns {IQHN.InteractionHandler.getIntersectedObjects_@pro;raycaster_@call;intersectObjects}
 */
IQHN.InteractionHandler.prototype.getIntersectedObjects_ = function (event) {
    var renderer = this.scene_.getWebGlHandler().getThreeRenderer();
    var camera = this.scene_.getWebGlHandler().getCamera();

    var rel_l = event.pageX - jQuery(renderer.domElement).position().left;
    var rel_t = event.pageY - jQuery(renderer.domElement).position().top;

    this.mouse_.x = (rel_l / renderer.domElement.width) * 2 - 1;
    this.mouse_.y = -(rel_t / renderer.domElement.height) * 2 + 1;

    this.raycaster_.setFromCamera(this.mouse_, camera);

    var intersects = this.raycaster_.intersectObjects(this.scene_.getWebGlHandler().getThreeScene().children, true);

    return intersects;
};

/**
 * For external usage (e.g. stop event propagation in creating bookmark form)
 */
IQHN.InteractionHandler.prototype.getEvents = function () {
    return this.events_;
};


IQHN.InteractionHandler.prototype.cleanup = function () {
   
    var canvas = this.scene_.getWebGlHandler().getCanvas();
    jQuery(canvas).off();
    jQuery(window).off();
    this.scene_ = null;
    this.raycaster_ = null;
};