
var IQHN = IQHN || {};


/**
 * Holding the visual representation and data of a segment in one of the rings
 * in the @see{IQHN.RingRepresentation}.
 * 
 * @param {IQHN.RingRepresentation} ring_representation Ring Representation
 * @param {integer} level Between 0 and *. Ring number
 * @param {float} start_percent 0...100 percent to start. 0 is on the top
 * @param {float} end_percent 0...100 percent to end. 0 is on the top
 * @param {integer} color color to fill
 * @param {string} key Key like "language"
 * @param {string} val Value like "de"
 */
IQHN.RingSegment = function (ring_representation, level, start_percent, end_percent, color, key, val, recs) {

    /** @type{IQHN.RingRepresentation} **/

    IQHN.Debugger.debug("RingSegment", [level, start_percent, end_percent], 6);

    this.ring_representation_ = ring_representation;

    this.data_ = {
        key: key,
        val: val
    };

    this.affected_recs_ = recs;

    this.default_color_ = color;
    this.level_ = level;

    this.start_pc_ = start_percent;
    this.end_pc_ = end_percent;

    this.dirty_ = true;

    this.webgl_objects_ = {
        ring_seg: null,
        label: null
    };

    this.relative_pos_ = null;

    this.is_selected_ = false;

    this.initAndRegisterGlObj();
};


/**
 * Initialize the ring-segments GL Objects.
 * These are the segment itself (Ring Geometry) and the label
 */
IQHN.RingSegment.prototype.initAndRegisterGlObj = function () {

    var ring_config = IQHN.config.collection.ring.ring_segment;

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


    var segment_middle_rad = (ring_end + ring_start) / 2;
    var radius_middle = (rad_outer + rad_inner) / 2;
    this.relative_pos_ = {
        x: Math.cos(segment_middle_rad) * radius_middle,
        y: Math.sin(segment_middle_rad) * radius_middle
    };


    /**
     * Segment
     */
    var seg_length = ring_end - ring_start;
    var seg_num_fact = seg_length / (Math.PI * 2);
    var seg_num = Math.round(ring_config.segments * seg_num_fact);

    var phi_seg_num = ring_config.phi_seg_num;

    var ring_geometry = new THREE.RingGeometry(rad_inner, rad_outer, seg_num, phi_seg_num, ring_start, seg_length);
    var mesh = new THREE.Mesh(ring_geometry, material);

    /** @type {IQHN.Collection} **/
    var collection = this.ring_representation_.getCollection();
    collection.getMeshContainerNode().add(mesh);

    this.webgl_objects_.ring_seg = mesh;

    //Register click-function
    mesh.interaction = {
        "mouseclick": this.handleClick.bind(this),
        "interaction_singleclick_exclusive": true
    };


    /**
     * Label
     */
    var label_config = IQHN.config.collection.ring.ring_segment.label;

    var label_options = {
        color: label_config.color,
        bg_color: null,
        font_size: label_config.font_size,
        pos_x: 0,
        pos_y: 0,
        pos_z: label_config.z_value
    };

    var text = this.data_.val;
    text = text.replace(" ", "\n");
    text = this.getShortText_(text);
    var label = new IQHN.Text(text, label_options, null, null, null, null, collection);
    this.webgl_objects_.label = label;


    //Check if corresponding filter is set -> Select
    if (this.data_.key.type === "facet") {
        var filters = IQHN.Scene.getCurrentScene().getFilterHandler().getFilters();
        var f_id = this.data_.key.id;
        var f_val = this.data_.val;

        for (var i = 0; i < filters.length; i++) {
            var curr_f = filters[i];
            if (curr_f.getKey().identifier !== f_id)
                continue;

            if (curr_f.getValue() === f_val) {
                this.select();
                break;
            }
        }
    }

};

/**
 * If Text (the label for the ringsegment) is an URL, just return the last part
 * of the URL
 * @param {string} text
 * @returns {string} cutted text
 */
IQHN.RingSegment.prototype.getShortText_ = function (text) {

    var re = /http[s]?:\/\/.*\/+([^\/]+)\/?/;
    var result = re.exec(text);
    if (!result)
        return text;

    return result[1];
};

/**
 * Rendering the ring segment
 */
IQHN.RingSegment.prototype.preRender = function () {

    if (!this.dirty_)
        return;

    IQHN.Debugger.debug("RingSegment",
            "Rendering RING SEGMENT",
            7);

    var pos = {x: 0, y: 0, z: 0};

    var z_pos = IQHN.config.collection.ring.ring_segment.z_value;

    this.webgl_objects_.ring_seg.position.set(
            pos.x,
            pos.y,
            z_pos
            );

    IQHN.Debugger.debug("RingSegment",
            "Setting pos to: " + pos.x + " " + pos.y + " " + z_pos,
            6);

    if (this.is_selected_)
        this.webgl_objects_.ring_seg.material.opacity = 1;
    else
        this.webgl_objects_.ring_seg.material.opacity = IQHN.config.collection.ring.ring_segment.opacity;


    this.webgl_objects_.label.setPosition(
            pos.x + this.relative_pos_.x,
            pos.y + this.relative_pos_.y,
            null
            );
    this.webgl_objects_.label.preRender();

    //this.webgl_objects_.ring_seg.geometry.computeBoundingSphere();
    this.dirty_ = false;
};



IQHN.RingSegment.prototype.handleClick = function () {
    IQHN.Debugger.debug("RingSegment",
            ["RING SEGMENT CLICKED", this],
            3);

    if (this.is_selected_)
        this.deSelect();
    else
        this.select();

};

/**
 * Visually select a ringsegment and apply a corresponding filter if flag is set
 * @param {bool} skip_filter_applying if true the segment only gets visually selected. No filter will be applied
 */
IQHN.RingSegment.prototype.select = function (skip_filter_applying) {
    if (this.is_selected_ === true)
        return;

    IQHN.Debugger.debug("RingSegment",
            "Selecting ring segment",
            6);

    /**
     * Deselect other ring-segments of this level
     */
    var other_ringsegs = this.ring_representation_.getRingSegments();
    for (var i = 0; i < other_ringsegs.length; i++) {

        /** @type{IQHN.RingSegment} **/
        var curr_ringseg = other_ringsegs[i];
        if (this.getLevel() !== curr_ringseg.getLevel() || curr_ringseg.getValue() === this.getValue())
            continue;
        curr_ringseg.deSelect(true);
    }

    if (this.data_.key.type === "facet" && !skip_filter_applying) {
        var filter = new IQHN.Filter(this.data_.key.id, this.data_.val);
        IQHN.Scene.getCurrentScene().getFilterHandler().addFilter(filter);
        IQHN.Scene.getCurrentScene().getFilterHandler().apply();
    }




    this.is_selected_ = true;
    this.setIsDirty(true);
};

/**
 * Visually deselect a ringsegment and remove a corresponding filter if flag is set
 * @param {bool} skip_filter_applying if true the segment only gets visually deselected. No filter will be removed
 */
IQHN.RingSegment.prototype.deSelect = function (skip_filter_applying) {

    if (this.is_selected_ === false)
        return;

    IQHN.Debugger.debug("RingSegment",
            "Deselecting ring segment",
            6);


    if (this.data_.key.type === "facet" && !skip_filter_applying) {

        IQHN.Scene.getCurrentScene().getFilterHandler().removeFilter(this.data_.key.id);
        IQHN.Scene.getCurrentScene().getFilterHandler().apply();
    }

    this.is_selected_ = false;
    this.setIsDirty(true);
};

IQHN.RingSegment.prototype.getIsSelected = function () {
    return this.is_selected_;
};

IQHN.RingSegment.prototype.setIsDirty = function (dirty) {

    if (dirty === this.dirty_)
        return;

    this.dirty_ = dirty;
    this.ring_representation_.setIsDirty(true);
};

IQHN.RingSegment.prototype.getIsDirty = function () {
    return this.dirty_;
};

/**
 * Get the level of the ring. Starting with 0
 * @returns {float}
 */
IQHN.RingSegment.prototype.getLevel = function () {
    return this.level_;
};

IQHN.RingSegment.prototype.getValue = function () {
    return this.data_.val;
};

/**
 * return object holding key-name and type (e.g. facet)
 */
IQHN.RingSegment.prototype.getKey = function () {
    return this.data_.key;
};

/**
 * Returning all recs that are affected by this segment.
 * @returns {Array}
 */
IQHN.RingSegment.prototype.getAffectedRecs = function () {
    return this.affected_recs_;
};

/**
 * Getting the center position around the collection
 * @returns {IQHN.RingSegment.relative_pos_}
 */
IQHN.RingSegment.prototype.getRelativePosition = function () {
    return this.relative_pos_;
};

/**
 * Get the length of the segment in Radians
 * @returns {float}
 */
IQHN.RingSegment.prototype.getRadLength = function () {

    var length_perc = this.end_pc_ - this.start_pc_;
    var length_rad = length_perc * 0.01 * Math.PI * 2;

    return length_rad;
};


IQHN.RingSegment.prototype.getDefaultColor = function () {
    return this.default_color_;
};

/**
 * Delete all webgl-objects
 */
IQHN.RingSegment.prototype.delete = function () {

    /** @type {IQHN.Collection} **/
    var collection = this.ring_representation_.getCollection();
    collection.getMeshContainerNode().remove(this.webgl_objects_.ring_seg);
    this.webgl_objects_.label.delete();
};