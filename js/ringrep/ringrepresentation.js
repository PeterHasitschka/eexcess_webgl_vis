var GLVIS = GLVIS || {};


/**
 * Repesenting data of a collection through a sunburst diagram.
 * It's built from several rings inside the recommendations. These rings hold
 * segments, that are represented by @see{GLVIS.RingSegment} objects.
 * @param {type} collection
 * @returns {undefined}
 */
GLVIS.RingRepresentation = function (collection) {
    this.collection_ = collection;
    this.dirty_ = true;
    this.ring_segments_ = [];

    this.max_level = null;

    this.tree_ = null;

    this.buildTree_();


    this.initAndRegisterGlObj();


    GLVIS.RingRepresentation.activeRepresentations.push(this);
};


GLVIS.RingRepresentation.prototype.buildTree_ = function () {

    GLVIS.Debugger.debug("RingRepresentation",
            "Building data-tree for Ring representation", 3);
    this.tree_ = new GLVIS.RingTree(this.collection_.getRecommendations());
};


GLVIS.RingRepresentation.prototype.initAndRegisterGlObj = function () {

    GLVIS.Debugger.debug("RingRepresentation",
            "Initializing Ring-Webgl-Objects", 4);

    if (!this.tree_)
        throw("Tree not initialized");

    var ring_structure = this.tree_.getRingStructure();

    GLVIS.Debugger.debug("RingRepresentation",
            ["Ring Structure", ring_structure], 4);


    for (var ring_count = 0; ring_count < ring_structure.length; ring_count++) {
        var curr_ring_data = ring_structure[ring_count];

        for (var seg_count = 0; seg_count < curr_ring_data.length; seg_count++) {

            var curr_ring_data_elm = curr_ring_data[seg_count];

            var color = null;

            if (curr_ring_data_elm.my_id.type === "facet") {
                var facet_name = curr_ring_data_elm.my_id.id;
                var facet_val = curr_ring_data_elm.my_val;
                var color_config = GLVIS.config.collection.recommendation.colors;
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
            this.ring_segments_.push(new GLVIS.RingSegment(this, ring_count, seg_start, seg_end, color, key, val, curr_ring_data_elm.recs));
        }
    }

    //Needed for finding the last ring
    this.max_level = ring_structure.length - 1;
};


/**
 * Called by collection. Only performs if dirty flag is true
 * @returns {undefined}
 */
GLVIS.RingRepresentation.prototype.render = function () {
    if (!this.dirty_)
        return;

    GLVIS.Debugger.debug("RingRepresentation",
            "Rendering RINGREPRESENTATION " + this.collection_.getId(),
            5);

    for (var i = 0; i < this.ring_segments_.length; i++) {
        this.ring_segments_[i].render();
    }

    this.dirty_ = false;
};


GLVIS.RingRepresentation.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
    this.collection_.setIsDirty(true);
};

/**
 * Delete all webgl-objects
 */
GLVIS.RingRepresentation.prototype.delete = function () {

    for (var i = 0; i < this.ring_segments_.length; i++) {
        this.ring_segments_[i].delete();
    }

    var index_to_delete = _.indexOf(GLVIS.RingRepresentation.activeRepresentations, this);
    GLVIS.RingRepresentation.activeRepresentations = GLVIS.RingRepresentation.activeRepresentations.splice(index_to_delete, 1);
};

/**
 * 
 * @returns {GLVIS.RingTree}
 */
GLVIS.RingRepresentation.prototype.getTree = function () {
    return this.tree_;
};

/**
 * @returns {GLVIS.Collection}
 */
GLVIS.RingRepresentation.prototype.getCollection = function () {
    return this.collection_;
};

/**
 * 
 * @returns {Array}
 */
GLVIS.RingRepresentation.prototype.getRingSegments = function () {
    return this.ring_segments_;
};


GLVIS.RingRepresentation.activeRepresentations = [];