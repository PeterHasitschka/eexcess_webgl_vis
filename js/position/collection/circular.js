var IQHN = IQHN || {};

/**
 * This position handler sets all collections on a circular path next to their parents.
 * This means that only one child per collections is supported.
 * @type @see{IQHN.config.scene.possible_vis_types} circle_type Ring or Bow
 * @returns {undefined}
 */
IQHN.CollectionPosCircular = function (circle_type) {

    /** @type {IQHN.Scene} **/
    this.scene_ = IQHN.Scene.getCurrentScene();


    this.coll_to_focus_ = null;

    this.circle_type_poshelper_ = null;
    switch (circle_type) {
        case IQHN.config.scene.possible_vis_types.RING :
            this.circle_type_poshelper_ = new IQHN.CollectionPosCircularTypeRing();
            break;

        case IQHN.config.scene.possible_vis_types.BOW :
            this.circle_type_poshelper_ = new IQHN.CollectionPosCircularTypeBow();
            break;

        default:
            throw ("Circle-Type +" + circle_type + " unknown!");
    }

};

/**
 * Calculate sorted parent-mapping
 * @param {array[IQHN.Collection]} collections
 * @returns {array}
 */
IQHN.CollectionPosCircular.prototype.getParentMapping_ = function (collections) {
    //Store parent-id and key in an array to sort it
    var parent_mapping = [];
    for (var coll_key = 0; coll_key < collections.length; coll_key++) {

        /** @type{IQHN.Collection} **/
        var current_collection = collections[coll_key];

        var coll_id = current_collection.getId();
        var coll_parent_id = current_collection.getParentId();

        parent_mapping.push([coll_key, coll_parent_id]);
    }

    //Sort array
    parent_mapping.sort(function (a, b) {
        if (a[1] === null)
            return b;

        return a[1] - b[1];
    });
    return parent_mapping;
};

/**
 * Sets the positions of each collections
 */
IQHN.CollectionPosCircular.prototype.calculatePositions = function () {

    IQHN.Debugger.debug("CollectionPosCircular",
            "COLLECTION POS HANDLER: Recalculating positions",
            5);


    var coll_to_focus = this.getCollToFocus();
    var collections = this.scene_.getCollections();

    if (!collections.length)
        return;

    var parent_mapping = this.getParentMapping_(collections);


    var num_cols = collections.length;


    /**
     * Nice dummy-sphere in the middle of the circle START
     */
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
    var coll_ring_radius = IQHN.Scene.getCurrentScene().getCollectionPositionHandler().getCollCircleRadius();
    sphere.position.set(0, 0, -coll_ring_radius);
    IQHN.Scene.getCurrentScene().getWebGlHandler().getThreeScene().add(sphere);
    /**
     * Nice dummy-sphere in the middle of the circle END
     */




    for (var coll_count = 0; coll_count < parent_mapping.length; coll_count++) {
        var collection_key = parent_mapping[coll_count][0];

        /** @type{IQHN.Collection} **/
        var current_collection = collections[collection_key];

        var index = coll_count + 1;

        var pos = this.getPosAndRot(index, collections.length);
        current_collection.setPosition(pos.x, null, pos.z);
        current_collection.setRotation(pos.degree);
    }
};

/**
 * 
 * @param {integer} index Signed Int. 0 is center -1 is next left 1 is next right etc...
 * @param {integer} numindizies Maximum number of collections to set pos
 * @returns {array}
 */
IQHN.CollectionPosCircular.prototype.getPosAndRot = function (index, numindizies) {

    var empty_spaces = this.circle_type_poshelper_.getAddEmptySpaces(numindizies);
    index += empty_spaces;
    numindizies += empty_spaces;

    var rad_step = (Math.PI * 2) / (numindizies);

    var curr_rad = 0 - (index * rad_step) + Math.PI / 2;

    var radius = IQHN.Scene.getCurrentScene().getCollectionPositionHandler().getCollCircleRadius();
    var pos = IQHN.Tools.getPosFromRad(curr_rad, radius);

    var degree = (curr_rad - Math.PI / 2) * 180 / Math.PI * -1;
    return {x: pos.x, z: pos.y - radius, degree: degree};
};

/**
 * Set Collection that gets focused after rendering the collections
 * @param {IQHN.Collection} coll
 */
IQHN.CollectionPosCircular.prototype.setCollToFocus = function (coll) {
    this.coll_to_focus_ = coll;
};

/**
 * Dummy
 * @param {bool} val
 */
IQHN.CollectionPosCircular.prototype.setIsOneFocused = function (val) {
};

/**
 * Get Collection that is set to be focused after rendering the collections
 * @returns {IQHN.Collection}
 */
IQHN.CollectionPosCircular.prototype.getCollToFocus = function () {
    return this.coll_to_focus_;
};


IQHN.CollectionPosCircular.prototype.getCollCircleRadius = function () {
    return this.circle_type_poshelper_.getCollCircleRadius();
};


/**
 * On creating a ring-segment this method is used to move the collection out of
 * the collection-circle to be near the camera. This helps to avoid problems with
 * the perspective. (Either the collections aren't visible or the fish-eye effect is too hard)
 * @param {IQHN.Collection} collection
 * @param {function} callback_fct
 */
IQHN.CollectionPosCircular.prototype.moveCollectionFromCenter = function (collection, callback_fct) {

    IQHN.Debugger.debug("CollectionPosCircular", "Moving coll " + collection.getId() + " away from center", 6);

    var config = IQHN.config.collection.focus;

    var circle_rad = this.getCollCircleRadius();
    var center_point = new THREE.Vector3(0, 0, -circle_rad);

    var coll_pos = collection.getPosition();


    if (!collection.getInitPos())
        collection.setInitPos({x: coll_pos.x, y: coll_pos.y, z: coll_pos.z});

    //Get the init pos to prevent problems during aborted animation where pos is somewhere...
    var coll_pos = collection.getInitPos();


    var coll_pos_vec = new THREE.Vector3(coll_pos.x, coll_pos.y, coll_pos.z);

    var distance_vec = coll_pos_vec.clone();
    distance_vec.sub(center_point);

    var orig_length = distance_vec.length();
    var goal_length = orig_length + config.move_out_dist;

    distance_vec.multiplyScalar((goal_length / orig_length));

    var new_pos = center_point.clone();
    new_pos.add(distance_vec);
    var new_pos_obj = {x: new_pos.x, y: new_pos.y, z: new_pos.z};

    var anim = IQHN.Scene.getCurrentScene().getAnimation();
    anim.register(
            config.animation.id + collection.getId(),
            new_pos_obj,
            null,
            collection.getPosition.bind(collection),
            collection.setPositionObj.bind(collection),
            0,
            config.animation.speed,
            config.animation.pow,
            config.animation.threshold,
            function () {
                callback_fct();
            },
            true
            );
};

/**
 * On removing a ring-segment this method is used to move the collection back to
 * the collection-circle.
 * @param {IQHN.Collection} collection
 */
IQHN.CollectionPosCircular.prototype.moveCollectionToCenter = function (collection) {

    IQHN.Debugger.debug("CollectionPosCircular", "Moving coll " + collection.getId() + " back to the center", 6);
    var orig_pos = collection.getInitPos();
    var config = IQHN.config.collection.focus;

    var anim = IQHN.Scene.getCurrentScene().getAnimation();
    anim.register(
            config.animation.id + collection.getId(),
            orig_pos,
            null,
            collection.getPosition.bind(collection),
            collection.setPositionObj.bind(collection),
            0,
            config.animation.speed,
            config.animation.pow,
            config.animation.threshold,
            function () {
            },
            true
            );
};