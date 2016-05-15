
IQHN = IQHN || {};


/**
 * Representing the node of a Collection in WebGl
 * @param {IQHN.Collection} collection collection that node represents
 * @param {THREE.Object3D | null} mesh_parent Object to use as webgl-parent
 */
IQHN.CollectionCenterNode = function (collection, mesh_parent) {

    /** @type{IQHN.Collection} **/
    this.collection_ = collection;

    this.default_color_ = IQHN.config.collection.center_node.circle.color;

    this.dirty_ = true;

    this.webgl_objects_ = {
        circle: null
    };

    this.initAndRegisterGlObj(mesh_parent);
};

IQHN.CollectionCenterNode.prototype.initAndRegisterGlObj = function (mesh_parent) {

    var circle_config = IQHN.config.collection.center_node.circle;

    var circleMaterial =
            new THREE.MeshBasicMaterial(
                    {
                        color: circle_config.color,
                        transparent: true,
                        side: THREE.DoubleSide
                    });


    var mesh = new THREE.CircleGeometry(circle_config.radius, circle_config.segments);

    var circle = new THREE.Mesh(
            mesh,
            circleMaterial);


    //Register click-function
    circle.interaction = {
        "mouseclick": this.collection_.handleClick.bind(this.collection_),
        "mouseover": this.collection_.handleCenterMouseover.bind(this.collection_)
    };
    circle.scene_obj = this.collection_;

    if (!mesh_parent) {
        var webgl_handler = IQHN.Scene.getCurrentScene().getWebGlHandler();
        webgl_handler.getThreeScene().add(circle);
    }
    else
        mesh_parent.add(circle);

    this.webgl_objects_.circle = circle;


};



IQHN.CollectionCenterNode.prototype.preRender = function () {

    if (!this.dirty_)
        return;


    IQHN.Debugger.debug("CollectionCenterNode",
            "Rendering COLLECTION CENTER-NODE  for collection " + this.collection_.getId(),
            7);


    var circle_color;
    if (this.collection_.getStatus() === IQHN.Collection.STATUSFLAGS.SELECTED)
        circle_color = IQHN.config.collection.center_node.circle.select_color;
    else
        circle_color = this.default_color_;

    this.webgl_objects_.circle.material.color.setHex(circle_color);



    var z_pos = IQHN.config.collection.center_node.circle.z_value;
    this.webgl_objects_.circle.position.setZ(
            z_pos
            );

    /*
     
     var pos = this.collection_.getPosition();
     
     var z_pos = IQHN.config.collection.center_node.circle.z_value;
     this.webgl_objects_.circle.position.set(
     pos.x,
     pos.y,
     z_pos
     );
     */
    this.dirty_ = false;
};







IQHN.CollectionCenterNode.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
};

IQHN.CollectionCenterNode.prototype.getIsDirty = function () {
    return this.dirty_;
};