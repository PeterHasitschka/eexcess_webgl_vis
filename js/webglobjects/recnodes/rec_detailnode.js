
GLVIS = GLVIS || {};


/**
 * Representing a detailed recommendation of a Collection in WebGl
 * @param {GLVIS.Recommendation} recommendation recommendation that node represents
 * @param {THREE.Object3D} mesh_parent
 */
GLVIS.RecommendationDetailNode = function (recommendation, mesh_parent) {

    this.dirty_ = true;
    this.recommendation_ = recommendation;

    this.webgl_objects_ = {
        group: new THREE.Object3D(),
        circle_outer: null,
        circle_inner: null,
        buttons: []
    };

    this.mesh_parent_ = mesh_parent;

    //Needed due to relative scaling.
    this.init_radius_ = this.recommendation_.getRadius() * this.recommendation_.getSizeFactor();

    this.initAndRegisterGlObj(mesh_parent);


    this.add_distance = GLVIS.config.collection.recommendation.detail_node.add_dinstance;
};

/**
 * Create and add ThreeJS Objects to scene.
 * All objects get added to a parent-mesh.
 * These objects are an outer circle with variable size (for visualizing the relevance)
 * an inner circle holding a preview image.
 * And several buttons with different actions @see{GLVIS.RecDetailNodeButton}
 * @param {THREE.Mesh} mesh_parent
 */
GLVIS.RecommendationDetailNode.prototype.initAndRegisterGlObj = function (mesh_parent) {

    var config = GLVIS.config.collection.recommendation.detail_node;


    mesh_parent.add(this.webgl_objects_.group);

    var inner_static_rad = config.inner_static_rad;


    var circle_outer_material =
            new THREE.MeshBasicMaterial(
                    {
                        color: this.recommendation_.getColor(),
                        transparent: true,
                        side: THREE.DoubleSide,
                        opacity: 0.8
                    });

    var circle_outer = new THREE.Mesh(
            new THREE.CircleGeometry(
                    this.init_radius_, //Changes at render
                    config.circle.segments
                    ),
            circle_outer_material);


    //Register click-function
    circle_outer.interaction = {
        "mouseclick": this.recommendation_.handleDetailNodeClick.bind(this.recommendation_),
        "interaction_singleclick_exclusive": true,
        "mouseover": this.recommendation_.handleMouseover.bind(this.recommendation_)
    };
    circle_outer.scene_obj = this.recommendation_;


    this.webgl_objects_.group.add(circle_outer);

    this.webgl_objects_.circle_outer = circle_outer;


    var myImage = new Image();

    var eexcess_data = this.recommendation_.getEexcessData();
    if (eexcess_data) {
        var result = eexcess_data.result;

        /**
         * A CORS Proxy may be necessary to load the thumbnail images from external ressources
         */
        var cors_proxy = config.cors_proxy;
        var preview_image = result.previewImage ? cors_proxy + result.previewImage : null;

        if (typeof (standalone_folder_prefix) !== "undefined")
            GLVIS.config.scene.media_folder = "../../media/";

        var image = preview_image || GLVIS.config.scene.media_folder + config.placeholder_img;

        /**
         * Create inner circle with image texture
         */
        var circle_inner_material =
                new THREE.MeshBasicMaterial(
                        {
                            color: 0XFF0000,
                            transparent: true,
                            side: THREE.DoubleSide,
                            opacity: 1,
                            visible: false
                        });
        var circle_inner = new THREE.Mesh(
                new THREE.CircleGeometry(
                        inner_static_rad,
                        config.circle.segments
                        ),
                circle_inner_material);

        circle_inner.scene_obj = this.recommendation_;

        this.webgl_objects_.group.add(circle_inner);
        this.webgl_objects_.circle_inner = circle_inner;


        GLVIS.Debugger.debug("RecommendationDetailNode", "Preview image exists... start loading", 5);

        THREE.ImageUtils.crossOrigin = '';
        THREE.ImageUtils.loadTexture(image, {}, function (texture) {

            GLVIS.Debugger.debug("RecommendationDetailNode", "Preview loaded. Creating texture", 5);
            texture.minFilter = THREE.LinearFilter;
            this.webgl_objects_.circle_inner.material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
                transparent: true,
                color: 0xFFFFFF,
                visible: true
            });
            texture.flipY = true;
            texture.needsUpdate = true;

            this.setIsDirty(true);
            this.recommendation_.setIsDirty(true);
        }.bind(this));
    }

    var forms = GLVIS.Scene.getCurrentScene().getForms();
    var recdbhandler = GLVIS.Scene.getCurrentScene().getRecDashboardHandler();
    //Add buttons
    var button_options = [
        {
            action: this.recommendation_.openLink.bind(this.recommendation_),
            icon: "button-icon-open.png",
            title: "Open in new tab",
            visible: false
        },
        {
            action: null,
            icon: "button-icon-filter.png",
            title: "Filter",
            visible: false
        },
        {
            action: recdbhandler.openBookmarkForm.bind(recdbhandler, this.recommendation_),
            icon: "button-icon-bookmark.png",
            title: "Bookmark",
            visible: false
        },
        {
            action: null,
            icon: "button-icon-ref.png",
            title: "Reference (use)",
            visible: false
        },
        {
            action: forms.createFormRecInfo.bind(forms, this.recommendation_),
            icon: "button-icon-info.png",
            title: "Show info",
            visible: false
        }

    ];

    for (var i = 0; i < button_options.length; i++) {
        var button = new GLVIS.RecDetailNodeButton(this, button_options[i]);
        this.webgl_objects_.buttons.push(button);
    }


    this.calculateButtonPositions_();
};


/**
 * Sets the position of the added buttons around the node
 */
GLVIS.RecommendationDetailNode.prototype.calculateButtonPositions_ = function () {

    var config = GLVIS.config.collection.recommendation.detail_node.button;
    var b_count = this.webgl_objects_.buttons.length;
    var rad = config.distance_rad;

    var step = Math.PI * 2 / b_count;

    var curr_angle = 0;
    for (var i = 0; i < b_count; i++) {

        /** @type {GLVIS.RecDetailNodeButton} **/
        var curr_button = this.webgl_objects_.buttons[i];
        var x = Math.cos(curr_angle) * rad;
        var y = Math.sin(curr_angle) * rad;

        curr_button.setPosition(x, y);

        curr_angle += step;
    }

};

/**
 * Rendering all webgl-objects if node is dirty.
 */
GLVIS.RecommendationDetailNode.prototype.render = function () {

    if (!this.dirty_)
        return;

    var config = GLVIS.config.collection.recommendation.detail_node;

    GLVIS.Debugger.debug(
            "RecommendationDetailNode",
            "Rendering RECOMMENDATION DETAIL-NODE  for recommendation " + this.recommendation_.getId(),
            7);

    var pos = this.recommendation_.getRelativePosition();


    var z_pos = config.z_value;
    this.webgl_objects_.group.position.set(
            pos.x,
            pos.y,
            pos.z
            );

    var curr_radius = config.inner_static_rad +
            config.gap_inner_circle +
            this.recommendation_.getSizeFactor() * config.size_factor_mult;


    var scale_factor = curr_radius / this.init_radius_;

    this.webgl_objects_.circle_outer.scale.set(scale_factor, scale_factor, scale_factor);
    this.webgl_objects_.circle_outer.material.opacity = this.recommendation_.getOpacity();
    this.webgl_objects_.circle_outer.material.color.setHex(this.recommendation_.getColor());

    if (this.webgl_objects_.circle_inner) {
        this.webgl_objects_.circle_inner.position.setZ(
                pos.z + config.z_diff_inner_circle
                );

        this.webgl_objects_.circle_inner.material.opacity = this.recommendation_.getOpacity(true);
    }

    for (var i = 0; i < this.webgl_objects_.buttons.length; i++) {
        this.webgl_objects_.buttons[i].render();
    }

    this.dirty_ = false;
};

/**
 * Returning the THREE-JS container holding all webgl-objects
 * @returns {GLVIS.RecommendationDetailNode.webgl_objects_.group}
 */
GLVIS.RecommendationDetailNode.prototype.getGroupMesh = function () {
    return this.webgl_objects_.group;
};

/**
 * Setting the node's buttons visible or not.
 * @param {bool} visible
 */
GLVIS.RecommendationDetailNode.prototype.setButtonsVisible = function (visible) {
    for (var i = 0; i < this.webgl_objects_.buttons.length; i++) {
        this.webgl_objects_.buttons[i].setIsVisible(visible);
    }
};


GLVIS.RecommendationDetailNode.prototype.setIsDirty = function (dirty) {

    if (this.dirty_ === dirty)
        return;

    this.dirty_ = dirty;
    this.recommendation_.setIsDirty(dirty);
};

GLVIS.RecommendationDetailNode.prototype.getIsDirty = function () {
    return this.dirty_;
};

/**
 * Returns the mesh of the inner circle
 * @returns {THREE.Mesh}
 */
GLVIS.RecommendationDetailNode.prototype.getCircle = function () {
    return this.webgl_objects_.circle_outer;
};

/**
 * Delete all GL-Objects and remove them from the scene
 */
GLVIS.RecommendationDetailNode.prototype.delete = function () {

    this.mesh_parent_.remove(this.webgl_objects_.group);

    for (var i = 0; i < this.webgl_objects_.buttons.length; i++)
        this.webgl_objects_.buttons[i].delete();

    delete this.webgl_objects_.group;
    delete this.webgl_objects_.circle_outer;
    if (this.webgl_objects_.circle_inner)
        delete this.webgl_objects_.circle_inner;
};