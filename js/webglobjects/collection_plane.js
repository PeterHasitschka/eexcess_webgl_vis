
IQHN = IQHN || {};


/**
 * Representing plane of a Collection in WebGl
 * @param {IQHN.Collection} collection collection that node represents
 * @param {THREE.Object3D | null} mesh_parent Object to use as webgl-parent
 */
IQHN.CollectionPlane = function (collection, mesh_parent) {

    /** @type{IQHN.Collection} **/
    this.collection_ = collection;

    this.default_color_ = IQHN.config.collection.plane.color;

    this.dirty_ = true;

    this.webgl_objects_ = {
        circle: null
    };

    this.initAndRegisterGlObj(mesh_parent);
};

IQHN.CollectionPlane.prototype.initAndRegisterGlObj = function (mesh_parent) {

    var plane_config = IQHN.config.collection.plane;

    var circleMaterial =
            new THREE.MeshBasicMaterial(
                    {
                        color: plane_config.color,
                        transparent: true,
                        side: THREE.DoubleSide,
                        opacity: plane_config.opacity
                    });

    var rad = IQHN.config.collection.plane.radius;
    var mesh = new THREE.CircleGeometry(rad, plane_config.segments);

    var circle = new THREE.Mesh(
            mesh,
            circleMaterial);


    //Register click-function
    circle.interaction = {
        "mouseclick": this.collection_.handleClick.bind(this.collection_),
        "mouseover": this.collection_.handleMouseover.bind(this.collection_),
        "interaction_id": "collection_center",
        "interaction_singleclick_per_type": true
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



IQHN.CollectionPlane.prototype.preRender = function () {

    if (!this.dirty_)
        return;


    IQHN.Debugger.debug("CollectionPlane",
            "Rendering COLLECTION PLANE  for collection " + this.collection_.getId(),
            7);

    var z_pos = IQHN.config.collection.plane.z_value;
    this.webgl_objects_.circle.position.setZ(
            z_pos
            );

    this.dirty_ = false;
};







IQHN.CollectionPlane.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
};

IQHN.CollectionPlane.prototype.getIsDirty = function () {
    return this.dirty_;
};