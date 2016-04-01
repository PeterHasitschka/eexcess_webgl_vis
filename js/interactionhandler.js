
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

    jQuery(document).ready(function () {

        //KEYDOWN
        jQuery(window).keydown(function (e) {

            this.handleKeyClick(e);

        }.bind(this));


        //MOUSE-CLICK ON SCENE  
        jQuery(canvas).click(function (event) {
            this.events_.mc = event;
            this.handleInteraction_(event, "mouseclick");
        }.bind(this));


        //MOUSE-MOVE (DRAGGED)
        var is_mouse_down_in_canvas = false;
        var mouse_x_prev = null;
        var mouse_y_prev = null;
        jQuery(canvas).mousedown(function (event) {
            this.events_.md = event;
            is_mouse_down_in_canvas = true;
            mouse_x_prev = event.clientX;
            mouse_y_prev = event.clientY;
        }.bind(this));

        jQuery(window).mouseup(function (event) {
            is_mouse_down_in_canvas = false;
        });

        jQuery(canvas).mouseleave(function (event) {
            is_mouse_down_in_canvas = false;
        });

        jQuery(canvas).mousemove(function (event) {

            this.handleInteraction_(event, "mouseover");


            if (!is_mouse_down_in_canvas)
                return;

            var zoom_factor = 1 / nh.getZoomFactor();
            var curr_mouse_x_diff = 0 - (event.clientX - mouse_x_prev) * zoom_factor;
            var curr_mouse_y_diff = (event.clientY - mouse_y_prev) * zoom_factor;

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
            mouse_x_prev = event.clientX;
            mouse_y_prev = event.clientY;

        }.bind(this));


        //MOUSE-WHEEL (ZOOM)
        
        //Chrome
        jQuery(canvas)[0].addEventListener("mousewheel", function (event) {
            nh.onMouseWheelMove(event, this.getIntersectedObjects_(event));
        }.bind(this));
        
        //Firefox (does not support mousewheel event)
        jQuery(canvas)[0].addEventListener("DOMMouseScroll", function (event) {
            nh.onMouseWheelMove(event, this.getIntersectedObjects_(event));
        }.bind(this));
        
        
        /*
         * Not working in new dashboard
         jQuery(canvas).on('scroll', function (event) {
         }.bind(this));
         */
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