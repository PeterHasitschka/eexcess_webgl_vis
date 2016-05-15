var IQHN = IQHN || {};


/**
 * Repesenting data of a collection through a sunburst diagram.
 * It's built from several rings inside the recommendations. These rings hold
 * segments, that are represented by @see{IQHN.RingSegment} objects.
 * @param {type} collection
 * @returns {undefined}
 */
IQHN.RingRepresentation = function (collection) {
    this.collection_ = collection;
    this.dirty_ = true;
    this.ring_segments_ = [];

    this.max_level = null;

    this.tree_ = null;

    this.buildTree_();


    this.initAndRegisterGlObj();


    IQHN.RingRepresentation.activeRepresentations.push(this);
};


IQHN.RingRepresentation.prototype.buildTree_ = function () {

    IQHN.Debugger.debug("RingRepresentation",
            "Building data-tree for Ring representation", 3);
    this.tree_ = new IQHN.RingTree(this.collection_.getRecommendations());
};


IQHN.RingRepresentation.prototype.initAndRegisterGlObj = function () {

    IQHN.Debugger.debug("RingRepresentation",
            "Initializing Ring-Webgl-Objects", 4);

    if (!this.tree_)
        throw("Tree not initialized");

    var ring_structure = this.tree_.getRingStructure();

    IQHN.Debugger.debug("RingRepresentation",
            ["Ring Structure", ring_structure], 4);


    for (var ring_count = 0; ring_count < ring_structure.length; ring_count++) {
        var curr_ring_data = ring_structure[ring_count];

        for (var seg_count = 0; seg_count < curr_ring_data.length; seg_count++) {

            var curr_ring_data_elm = curr_ring_data[seg_count];

            var color = null;

            if (curr_ring_data_elm.my_id.type === "facet") {
                var facet_name = curr_ring_data_elm.my_id.id;
                var facet_val = curr_ring_data_elm.my_val;
                var color_config = IQHN.config.collection.recommendation.colors;
                if (color_config[facet_name] !== undefined)
                    if (color_config[facet_name][facet_val] !== undefined)
                        color = color_config[facet_name][facet_val];
            }

            /**
             * Calculate a color from the config combined with some random brightness
             */
            if (color === null) {
                var ring_base_color = color_config.rings["r" + (ring_count + 1)];
                var rand_fact = parseInt((0.5 - Math.random()) * 255);

                color = 0;

                var min_val = 0;

                for (var i = 0; i < 32; i += 8) {
                    var cur_col = (ring_base_color & (0x0000FF << i)) >> i;
                    cur_col += rand_fact;
                    cur_col = parseInt(Math.max(min_val, Math.min(255, cur_col)));
                    color += (cur_col << i);
                }
                color = parseInt(color);
            }

            var seg_start = curr_ring_data_elm.position * 100;

            var seg_end = 100;
            if (seg_count + 1 !== curr_ring_data.length)
                seg_end = curr_ring_data[seg_count + 1].position * 100;

            var key = curr_ring_data_elm.my_id;
            var val = curr_ring_data_elm.my_val;
            this.ring_segments_.push(new IQHN.RingSegment(this, ring_count, seg_start, seg_end, color, key, val, curr_ring_data_elm.recs));
        }
    }

    //Needed for finding the last ring
    this.max_level = ring_structure.length - 1;
};


/**
 * Called by collection. Only performs if dirty flag is true
 * @returns {undefined}
 */
IQHN.RingRepresentation.prototype.preRender = function () {
    if (!this.dirty_)
        return;

    IQHN.Debugger.debug("RingRepresentation",
            "Rendering RINGREPRESENTATION " + this.collection_.getId(),
            5);

    for (var i = 0; i < this.ring_segments_.length; i++) {
        this.ring_segments_[i].preRender();
    }

    this.dirty_ = false;
};


IQHN.RingRepresentation.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
    this.collection_.setIsDirty(true);
};

/**
 * Delete all webgl-objects
 */
IQHN.RingRepresentation.prototype.delete = function () {

    for (var i = 0; i < this.ring_segments_.length; i++) {
        this.ring_segments_[i].delete();
    }

    var index_to_delete = _.indexOf(IQHN.RingRepresentation.activeRepresentations, this);
    IQHN.RingRepresentation.activeRepresentations = IQHN.RingRepresentation.activeRepresentations.splice(index_to_delete, 1);
};

/**
 * 
 * @returns {IQHN.RingTree}
 */
IQHN.RingRepresentation.prototype.getTree = function () {
    return this.tree_;
};

/**
 * @returns {IQHN.Collection}
 */
IQHN.RingRepresentation.prototype.getCollection = function () {
    return this.collection_;
};

/**
 * 
 * @returns {Array}
 */
IQHN.RingRepresentation.prototype.getRingSegments = function () {
    return this.ring_segments_;
};


/**
 * Returning objects containing the value and color of ringsegments of a specific ring
 * Used inside @see{FilterVisCategoryHex} and other Filter-Plugins
 * @param {String} facet_name
 * @returns {Array}
 */
IQHN.RingRepresentation.prototype.getColorsOfRing = function (facet_name) {

    var ringsecs = this.getRingSegments();
    var colors = [];
    for (var i = 0; i < ringsecs.length; i++) {
        /** @type{IQHN.RingSegment} **/
        var curringsec = ringsecs[i];

        if (curringsec.getKey().id !== facet_name)
            continue;

        colors.push({
            name: curringsec.getValue(),
            color: "#" + curringsec.getDefaultColor().toString(16)
        });
    }

    return colors;
};

IQHN.RingRepresentation.activeRepresentations = [];