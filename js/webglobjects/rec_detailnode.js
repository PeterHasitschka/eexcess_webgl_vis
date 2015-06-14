
GLVIS = GLVIS || {};


/**
 * Representing a detailed recommendation of a Collection in WebGl
 * @param {GLVIS.Recommendation} recommendation recommendation that node represents
 */
GLVIS.RecommendationDetailNode = function (recommendation) {

    this.dirty_ = true;
    this.recommendation_ = recommendation;

    this.webgl_objects_ = {
        sphere: null
    };

    //Needed due to relative scaling.
    this.init_radius_ = this.recommendation_.getRadius();

    this.initAndRegisterGlObj();
};

GLVIS.RecommendationDetailNode.prototype.initAndRegisterGlObj = function () {

    var config = GLVIS.config.collection.recommendation.detail_node;

    var sphereMaterial =
            new THREE.MeshBasicMaterial(
                    {
                        color: this.recommendation_.getColor(),
                        transparent: true
                    });

    var sphere = new THREE.Mesh(
            new THREE.SphereGeometry(
                    this.init_radius_,
                    config.sphere.segments,
                    config.sphere.rings),
            sphereMaterial);


    //Register click-function
    sphere.interaction = {
        "mouseclick": this.recommendation_.handleClick,
        "recommendation": this.recommendation_
    };

    var webgl_handler = GLVIS.Scene.getCurrentScene().getWebGlHandler();
    webgl_handler.getThreeScene().add(sphere);

    this.webgl_objects_.sphere = sphere;


    var eexcess_data = this.recommendation_.getEexcessData();
    if (eexcess_data) {
        var result = eexcess_data.result;
        var preview_image = result.previewImage;

        //DUMMY FOR EVERYONE!
        if (!preview_image)
            preview_image = "/visualizations/WebGlVisualization/media/testtexture.jpg";

        if (preview_image) {

            GLVIS.Debugger.debug("RecommendationDetailNode", "Preview image exists... start loading", 5);

            var that = this;
            THREE.ImageUtils.loadTexture(preview_image, {}, function (texture) {

                GLVIS.Debugger.debug("RecommendationDetailNode", "Preview loaded. Creating texture", 5);
                texture.minFilter = THREE.LinearFilter;
                that.webgl_objects_.sphere.material = new THREE.MeshBasicMaterial({
                    map: texture
                });
                texture.needsUpdate = true;

                that.setIsDirty(true);
                that.recommendation_.setIsDirty(true);
            });
        }
    }
};

GLVIS.RecommendationDetailNode.prototype.render = function () {

    if (!this.dirty_)
        return;

    GLVIS.Debugger.debug(
            "RecommendationDetailNode",
            "Rendering RECOMMENDATION DETAIL-NODE  for recommendation " + this.recommendation_.getId(),
            5);

    var abs_pos = this.recommendation_.getPosition();

    var z_pos = GLVIS.config.collection.recommendation.common_node.z_value;
    this.webgl_objects_.sphere.position.set(
            abs_pos.x,
            abs_pos.y,
            z_pos
            );

    var curr_radius = this.recommendation_.getRadius();
    var scale_factor = curr_radius / this.init_radius_;
    this.webgl_objects_.sphere.scale.set(scale_factor, scale_factor, scale_factor);

    this.webgl_objects_.sphere.material.opacity = this.recommendation_.getOpacity();

};

GLVIS.RecommendationDetailNode.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
};

GLVIS.RecommendationDetailNode.prototype.getIsDirty = function () {
    return this.dirty_;
};

/**
 * Delete all GL-Objects and remove them from the scene
 */
GLVIS.RecommendationDetailNode.prototype.delete = function () {

    var three_scene = GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene();
    three_scene.remove(this.webgl_objects_.sphere);

    delete this.webgl_objects_.sphere;
};