var GLVIS = GLVIS || {};


GLVIS.RingTree = function (recs) {

    GLVIS.Debugger.debug("RingTree",
            "Creating Ring Tree", 3);

    this.recs_ = recs;
    this.data_structure_ = GLVIS.config.collection.ring.data;

    this.tree_ = null;
    this.buildBasicTree_();
};


/**
 * Building an (unordered) tree with the specified structure as inner nodes
 * holding the recommendations as leafs
 */
GLVIS.RingTree.prototype.buildBasicTree_ = function () {

    GLVIS.Debugger.debug("RingTree",
            "Building ring-tree", 3);

    //Smallest level (=key) in config
    var level_to_start = 1;
    var tree = this.getSubtree_(this.recs_, this.data_structure_, level_to_start, null);

    GLVIS.Debugger.debug("RingTree", tree, 3);
    this.tree_ = tree;
};


/**
 * Separating recommendations recursively by a specified key.
 * @param {Array} recs Holding the @see{GLVIS.Recommendation} nodes to separate
 * @param {object} structures Config values holding id (key) and type (e.g. 'facet') @see{GLVIS.config.collection.ring.data}
 * @param {integer} current_depth Current structure id. Beware that these may not be 0...n indizies.
 * @param {string} val Current value. Just for storing in tree
 * @returns {Object}
 */
GLVIS.RingTree.prototype.getSubtree_ = function (recs, structures, current_depth, val) {

    var structure = structures[current_depth];

    if (!structure)
        return false;

    GLVIS.Debugger.debug("RingTree", ["Calling treebuilder, level " + current_depth, structure, val], 5);

    var sorted_recs = {};

    //Collect recommendations 
    for (var i = 0; i < recs.length; i++) {
        /** @type{GLVIS.Recommendation} **/
        var curr_rec = recs[i];
        var rec_val = this.getValue(curr_rec, structure);

        if (sorted_recs[rec_val] === undefined)
            sorted_recs[rec_val] = [];

        sorted_recs[rec_val].push(curr_rec);
    }

    var children = [];

    for (var key in sorted_recs) {
        var subtree = this.getSubtree_(sorted_recs[key], structures, current_depth + 1, key);
        if (subtree) {
            children.push(subtree);
            subtree.my_val = key;
            subtree.my_id = structure;
        }
    }

    var tree = {
        children_separate_id: structure,
        children: children
    };
    return tree;
};




GLVIS.RingTree.prototype.getValue = function (rec, structure) {

    switch (structure.type) {
        
        case "facet" :
            var eexcess_data = rec.getEexcessData();

            if (!eexcess_data)
                throw ("ERROR: NO EEXCESS DATA FOUND");

            var id = structure.id;
            var val = eexcess_data.result.facets[id];
            return val;

            break;

        default:
            throw ("ERROR: TYPE " + structure.type + " UNKNOWN");
    }
};