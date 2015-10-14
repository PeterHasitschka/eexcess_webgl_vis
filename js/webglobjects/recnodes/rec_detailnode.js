
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

GLVIS.RecommendationDetailNode.prototype.initAndRegisterGlObj = function (mesh_parent) {

    var config = GLVIS.config.collection.recommendation.detail_node;


    mesh_parent.add(this.webgl_objects_.group);

    var inner_static_rad = config.inner_static_rad;


    var circle_outer_material =
            new THREE.MeshBasicMaterial(
                    {
                        color: this.recommendation_.getColor(),
                        transparent: true,
                        side: THREE.DoubleSide
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


    this.webgl_objects_.group.add(circle_outer);

    this.webgl_objects_.circle_outer = circle_outer;



    var eexcess_data = this.recommendation_.getEexcessData();
    if (eexcess_data) {
        var result = eexcess_data.result;
        var preview_image = result.previewImage;

        //DUMMY FOR EVERYONE!
        if (!preview_image)
            preview_image = GLVIS.config.scene.media_folder + "testtexture.jpg";

        if (preview_image) {

            /**
             * Create inner circle with image texture
             */
            var circle_inner_material =
                    new THREE.MeshBasicMaterial(
                            {
                                color: 0XFF0000,
                                transparent: true,
                                side: THREE.DoubleSide
                            });
            var circle_inner = new THREE.Mesh(
                    new THREE.CircleGeometry(
                            inner_static_rad,
                            config.circle.segments
                            ),
                    circle_inner_material);

            this.webgl_objects_.group.add(circle_inner);
            this.webgl_objects_.circle_inner = circle_inner;


            GLVIS.Debugger.debug("RecommendationDetailNode", "Preview image exists... start loading", 5);

            var that = this;
            THREE.ImageUtils.loadTexture(preview_image, {}, function (texture) {

                GLVIS.Debugger.debug("RecommendationDetailNode", "Preview loaded. Creating texture", 5);
                texture.minFilter = THREE.LinearFilter;
                that.webgl_objects_.circle_inner.material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.5,
                    color: 0xFFFFFF
                });
                texture.flipY = true;
                texture.needsUpdate = true;

                that.setIsDirty(true);
                that.recommendation_.setIsDirty(true);
            });
        }


        //Add buttons

        var button_options = {
            action: this.testAction,
            x_offset: 0,
            icon: "button-icon-link.png",
            visible: true
        };

        var buttonX = new GLVIS.RecDetailNodeButton(this, button_options);
        this.webgl_objects_.buttons.push(buttonX);
    }
};
GLVIS.RecommendationDetailNode.prototype.testAction = function () {
    alert("testaction");
};

GLVIS.RecommendationDetailNode.prototype.getGroupMesh = function () {
    return this.webgl_objects_.group;
};

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


};

GLVIS.RecommendationDetailNode.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
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