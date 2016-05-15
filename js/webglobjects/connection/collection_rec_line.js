var IQHN = IQHN || {};


/**
 * 
 * @param {IQHN.Recommendation} recommendation
 * @param {THREE.Object3D} mesh_parent 
 */
IQHN.ConnectionCollectionRecommendation = function (recommendation, mesh_parent) {

    /** @type{IQHN.Recommendation} **/
    this.recommendation_ = recommendation;
    this.dirty_ = true;

    this.webgl_objects_ = {
        line: null
    };

    this.initAndRegisterGlObj(mesh_parent);
};

IQHN.ConnectionCollectionRecommendation.prototype.initAndRegisterGlObj = function (mesh_parent) {

    var config = IQHN.config.connection.recommendation_collection;


    var line_material = new THREE.LineBasicMaterial({
        color: config.color,
        linewidth: config.width,
        transparent: true
    });

    var line_geometry = new THREE.Geometry();
    line_geometry.vertices.push(new THREE.Vector3(
            0.0,
            0.0,
            config.width
            )
            );

    line_geometry.vertices.push(new THREE.Vector3(
            0.0,
            0.0,
            config.width
            ))
            ;

    line_geometry.computeBoundingSphere();


    this.webgl_objects_.line = new THREE.Line(line_geometry, line_material);
    mesh_parent.add(this.webgl_objects_.line);
};


IQHN.ConnectionCollectionRecommendation.prototype.preRender = function () {

    if (!this.dirty_)
        return;

    var config = IQHN.config.connection.recommendation_collection;
    /** @type{IQHN.Recommendation} **/
    var rec = this.recommendation_;
    var rec_pos = rec.getRelativePosition();

    var coll_pos = rec.getCollection().getPosition();

    IQHN.Debugger.debug("ConnectionCollectionRecommendation",
            "Rendering CONNECTION for recommendation " + rec.getId(),
            7);


    this.webgl_objects_.line.geometry.vertices[0].set(rec_pos.x, rec_pos.y, config.z);
    this.webgl_objects_.line.geometry.vertices[1].set(0, 0, config.z);
    this.webgl_objects_.line.geometry.verticesNeedUpdate = true;

    //Necessary for camera movement
    this.webgl_objects_.line.geometry.computeBoundingSphere();

    var width = config.width;

    this.webgl_objects_.line.material.linewidth = width;
};



IQHN.ConnectionCollectionRecommendation.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
};

IQHN.ConnectionCollectionRecommendation.prototype.getIsDirty = function () {
    return this.dirty_;
};