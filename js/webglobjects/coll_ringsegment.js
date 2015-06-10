
var GLVIS = GLVIS || {};


/**
 * Holding the visual representation and data of a segment in one of the rings
 * in the @see{GLVIS.RingRepresentation}.
 * 
 * @param {GLVIS.RingRepresentation} ring_representation Ring Representation
 * @param {integer} level Between 0 and *. Ring number
 * @param {float} start_percent 0...100 percent to start. 0 is on the top
 * @param {float} end_percent 0...100 percent to end. 0 is on the top
 * @param {integer} color color to fill
 * @param {string} key Key like "language"
 * @param {string} val Value like "de"
 */
GLVIS.RingSegment = function (ring_representation, level, start_percent, end_percent, color, key, val) {

    /** @type{GLVIS.RingRepresentation} **/
    this.ring_representation_ = ring_representation;

    this.data_ = {
        key: key,
        val: val
    };


    this.default_color_ = color;
    this.level_ = level;

    this.start_pc_ = start_percent;
    this.end_pc_ = end_percent;

    this.dirty_ = true;

    this.webgl_objects_ = {
        ring_seg: null,
        label: null
    };

    this.is_selected_ = false;

    this.initAndRegisterGlObj();
};

GLVIS.RingSegment.prototype.initAndRegisterGlObj = function () {

    var ring_config = GLVIS.config.collection.ring.ring_segment;

    var material =
            new THREE.MeshBasicMaterial(
                    {
                        color: this.default_color_,
                        side: THREE.DoubleSide,
                        transparent: true
                    });

    var rad_inner = ring_config.min_distance + this.level_ * (ring_config.thickness + ring_config.gap);
    var rad_outer = rad_inner + ring_config.thickness;

    var rad_fact = Math.PI * 2;

    var ring_start = this.start_pc_ * 0.01 * rad_fact - (Math.PI / 2);
    var ring_end = this.end_pc_ * 0.01 * rad_fact - (Math.PI / 2);

    var ring_geometry = new THREE.RingGeometry(rad_inner, rad_outer, ring_config.segments, 8, ring_start, ring_end - ring_start);
    var mesh = new THREE.Mesh(ring_geometry, material);

    var webgl_handler = GLVIS.Scene.getCurrentScene().getWebGlHandler();
    webgl_handler.getThreeScene().add(mesh);
    this.webgl_objects_.ring_seg = mesh;

    //Register click-function
    mesh.interaction = {
        "mouseclick": this.handleClick,
        "ringseg": this
    };



    var segment_middle_rad = (ring_end + ring_start) / 2;
    var radius_middle = (rad_outer + rad_inner) / 2;
    var segment_center = {
        x: Math.cos(segment_middle_rad) * radius_middle,
        y: Math.sin(segment_middle_rad) * radius_middle
    };



    /**
     * DUMMY SPHERE TO DETERMINE CENTER FOR LABEL
     */


    var sphereMaterial =
            new THREE.MeshBasicMaterial(
                    {
                        color: 0xFF0000,
                        transparent: true
                    });

    var sphere = new THREE.Mesh(
            new THREE.SphereGeometry(
                    10,
                    10,
                    10),
            sphereMaterial);
    webgl_handler.getThreeScene().add(sphere);






    this.webgl_objects_.label = sphere;
    sphere.rel_pos = {
        x: segment_center.x,
        y: segment_center.y
    };

};



GLVIS.RingSegment.prototype.render = function () {

    if (!this.dirty_)
        return;

    GLVIS.Debugger.debug("RingSegment",
            "Rendering RING SEGMENT",
            7);

    var pos = this.ring_representation_.getPosition();

    var z_pos = GLVIS.config.collection.ring.ring_segment.z_value;

    this.webgl_objects_.ring_seg.position.set(
            pos.x,
            pos.y,
            z_pos
            );

    GLVIS.Debugger.debug("RingSegment",
            "Setting pos to: " + pos.x + " " + pos.y + " " + z_pos,
            6);

    if (this.is_selected_)
        this.webgl_objects_.ring_seg.material.opacity = 1;
    else
        this.webgl_objects_.ring_seg.material.opacity = GLVIS.config.collection.ring.ring_segment.opacity;



    this.webgl_objects_.label.position.set(
            pos.x + this.webgl_objects_.label.rel_pos.x,
            pos.y + this.webgl_objects_.label.rel_pos.y,
            z_pos - 1
            );



    //this.webgl_objects_.ring_seg.geometry.computeBoundingSphere();
    this.dirty_ = false;
};



GLVIS.RingSegment.prototype.handleClick = function () {

    GLVIS.Debugger.debug("RingSegment",
            "RING SEGMENT CLICKED",
            3);

    var that = this.ringseg;

    that.is_selected_ = !that.is_selected_;
    that.setIsDirty(true);

};

GLVIS.RingSegment.prototype.deSelect = function () {

    if (this.is_selected_ !== true)
        return;

    GLVIS.Debugger.debug("RingSegment",
            "Deselecting ring segment",
            6);

    this.is_selected_ = true;
    this.setIsDirty(true);
};


GLVIS.RingSegment.prototype.setIsDirty = function (dirty) {

    if (dirty === this.dirty_)
        return;

    this.dirty_ = dirty;
    this.ring_representation_.setIsDirty(true);
};

GLVIS.RingSegment.prototype.getIsDirty = function () {
    return this.dirty_;
};