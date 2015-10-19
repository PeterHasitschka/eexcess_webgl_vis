var GLVIS = GLVIS || {};

/**
 * This position handler sets all collections on a circular path next to their parents.
 * This means that only one child per collections is supported.
 * @type @see{GLVIS.config.scene.possible_vis_types} circle_type Ring or Bow
 * @returns {undefined}
 */
GLVIS.CollectionPosCircular = function (circle_type) {

    /** @type {GLVIS.Scene} **/
    this.scene_ = GLVIS.Scene.getCurrentScene();


    this.coll_to_focus_ = null;

    this.circle_type_poscalculator_ = null;
    switch (circle_type) {
        case GLVIS.config.scene.possible_vis_types.RING :
            this.circle_type_poscalculator_ = new GLVIS.CollectionPosCircularTypeRing();
            break;

        case GLVIS.config.scene.possible_vis_types.BOW :
            this.circle_type_poscalculator_ = new GLVIS.CollectionPosCircularTypeBow();
            break;

        default:
            throw ("Circle-Type +" + circle_type + " unknown!");
    }

};

/**
 * Calculate sorted parent-mapping
 * @param {array[GLVIS.Collection]} collections
 * @returns {array}
 */
GLVIS.CollectionPosCircular.prototype.getParentMapping_ = function (collections) {
    //Store parent-id and key in an array to sort it
    var parent_mapping = [];
    for (var coll_key = 0; coll_key < collections.length; coll_key++) {

        /** @type{GLVIS.Collection} **/
        var current_collection = collections[coll_key];

        var coll_id = current_collection.getId();
        var coll_parent_id = current_collection.getParentId();

        parent_mapping.push([coll_key, coll_parent_id]);
    }

    //Sort array
    parent_mapping.sort(function (a, b) {
        if (a[1] === null)
            return b;

        return b[1] - a[1];
    });

    return parent_mapping;
};

/**
 * Sets the positions of each collections
 */
GLVIS.CollectionPosCircular.prototype.calculatePositions = function () {

    GLVIS.Debugger.debug("CollectionPosCircular",
            "COLLECTION POS HANDLER: Recalculating positions",
            5);


    var coll_to_focus = this.getCollToFocus();
    var collections = this.scene_.getCollections();

    if (!collections.length)
        return;

    var parent_mapping = this.getParentMapping_(collections);


    var num_cols = collections.length;
    var center_id = num_cols - 1;


    var sphereMaterial =
            new THREE.MeshBasicMaterial(
                    {
                        color: 0x00FF00,
                        transparent: false,
                        side: THREE.DoubleSide
                    });

    var mesh = new THREE.SphereGeometry(30, 20, 20);
    var sphere = new THREE.Mesh(
            mesh,
            sphereMaterial);

    sphere.position.set(0, 0, -GLVIS.config.scene.circle_radius);

    GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene().add(sphere);



    for (var coll_count = 0; coll_count < parent_mapping.length; coll_count++) {
        var collection_key = parent_mapping[coll_count][0];

        /** @type{GLVIS.Collection} **/
        var current_collection = collections[collection_key];

        var index = coll_count - center_id;
        var pos = this.circle_type_poscalculator_.getPosAndRot(index, collections.length);

        current_collection.setPosition(pos.x, null, pos.z);
        current_collection.setRotation(pos.degree);
    }
};

/**
 * Set Collection that gets focused after rendering the collections
 * @param {GLVIS.Collection} coll
 */
GLVIS.CollectionPosCircular.prototype.setCollToFocus = function (coll) {
    this.coll_to_focus_ = coll;
};

/**
 * Dummy
 * @param {bool} val
 */
GLVIS.CollectionPosCircular.prototype.setIsOneFocused = function (val) {
};

/**
 * Get Collection that is set to be focused after rendering the collections
 * @returns {GLVIS.Collection}
 */
GLVIS.CollectionPosCircular.prototype.getCollToFocus = function () {
    return this.coll_to_focus_;
};
