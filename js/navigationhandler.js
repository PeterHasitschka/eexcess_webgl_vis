var GLVIS = GLVIS || {};


/**
 * Handling the visual navigation of the scene
 * @param {GLVIS.Scene} scene Current scene
 */
GLVIS.NavigationHandler = function (scene) {
    /** @type {GLVIS.Scene} **/
    this.scene_ = scene;

    /** @type {THREE.Vector3} **/
    this.lookat_lock_ = null;

    this.animationconfig_ = GLVIS.config.navigation.animation_ids;
};

/**
 * 
 * Move the camera on a position on a virtual circle outside the circular-collection circle
 * facing the focused point.
 * The focused point and the center of the collection-circle is on on one line with the camera
 * 
 * @param {float} x
 * @param {float} y
 * @param {float} z
 * @param {float | null} distance_fact if not null distance factor gets set
 * @param {bool} animate
 * @param {function} cb Only called if animated
 */
GLVIS.NavigationHandler.prototype.setCameraToCircle = function (x, y, z, distance_fact, animate, cb) {

    if (x === undefined)
        x = null;
    if (y === undefined)
        y = null;
    if (z === undefined)
        z = null;

    if (x === null | y === null | z === null) {
        throw Exception("All cordinate values needed!");
    }

    var missing_degrees = this.getMissingCameraDegrees(x, y, z);
    this.moveCameraAroundCircle(missing_degrees.h, missing_degrees.v, true);

    if (distance_fact !== null)
        this.setDistanceFactor(distance_fact, animate);

};


/**
 * Convert the current Camera position to a relative H and V degree to the zero point
 * @returns {object} Holding 'h' (Horizontal degree), 'v' (Vertical degree)
 */
GLVIS.NavigationHandler.prototype.getCurrentHVDegree = function () {
    return GLVIS.Tools.MultVarOps.mult(-1, this.getMissingCameraDegrees(0, 0, 0));
};


/**
 * Difference of the current degree  (@see{GLVIS.NavigationHandler.prototype.getDegreeOnCameraSphere_})
 * and the camera position.
 * @param {float} goal_x
 * @param {float} goal_y
 * @param {float} goal_z
 * @returns {object} Holding 'h' (Horizontal degree), 'v' (Vertical degree)
 */
GLVIS.NavigationHandler.prototype.getMissingCameraDegrees = function (goal_x, goal_y, goal_z) {

    var camera = GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera();
    var camera_degree = this.getDegreeOnCameraSphere_(camera.position.x, camera.position.y, camera.position.z);

    var goal_degree = this.getDegreeOnCameraSphere_(goal_x, goal_y, goal_z);

    return {h: goal_degree.h - camera_degree.h, v: goal_degree.v - camera_degree.v};
};


/**
 * Getting the current on the camera sphere.
 * That means a horizontal and vertical degree of the path between camera position
 * and circle center where it hits the sphere
 * @param {float} x
 * @param {float} y
 * @param {float} z
 * @returns {object} Holding 'h' (Horizontal degree), 'v' (Vertical degree)
 */
GLVIS.NavigationHandler.prototype.getDegreeOnCameraSphere_ = function (x, y, z) {

    var coll_circle_d = GLVIS.Scene.getCurrentScene().getCollectionPositionHandler().getCollCircleRadius();
    ;
    var coll_circle_center_v = new THREE.Vector3(0, 0, 0 - coll_circle_d);


    var pos_v = new THREE.Vector3(x, y, z);
    pos_v.sub(coll_circle_center_v);
    var pos_center_d = pos_v.clone().length();
    pos_v.divideScalar(pos_center_d);

    //pos-v is normalized in zero point now

    var rad_h = Math.atan2(pos_v.x, pos_v.z);

    //Rotate around y to determine vertical rotation
    pos_v.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0 - rad_h);
    //Avoid floating point problems (1.00000001)
    var z_val = pos_v.z > 1.0 ? 1.0 : pos_v.z;
    var z_val = z_val < -1.0 ? -1.0 : z_val;

    var rad_v = Math.acos(z_val);

    var h = rad_h * 180 / Math.PI;
    var v = rad_v * 180 / Math.PI;

    if (v > 0 && y < 0)
        v *= -1;

    return {h: h, v: v};
};


GLVIS.NavigationHandler.prototype.moveCameraAroundCircleWObj = function (h_v) {
    GLVIS.NavigationHandler.prototype.moveCameraAroundCircle(h_v.h, h_v.v, true);
};

/**
 * Rotate the camera on a virtual sphere outside the circular-view circle by 2 delta values
 * 
 * @param {float} degree_h_delta Movement around the circle
 * @param {float} degree_b_delta Vertical tilt
 * @param {bool} keep_distance If true distance does not get reset to config
 */
GLVIS.NavigationHandler.prototype.moveCameraAroundCircle = function (degree_h_delta, degree_v_delta, keep_distance) {

    if (degree_h_delta === null || degree_h_delta === undefined)
        degree_h_delta = 0;

    if (degree_v_delta === null || degree_v_delta === undefined)
        degree_v_delta = 0;

    var coll_circle_radius = GLVIS.Scene.getCurrentScene().getCollectionPositionHandler().getCollCircleRadius();
    ;
    var coll_circle_vec = new THREE.Vector3(0, 0, 0 - coll_circle_radius);

    var camera = GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera();

    /** @type {THREE.Vector3} **/
    var current_camera_pos = camera.position.clone();

    var camera_distance_to_colls;

    if (!keep_distance)
        camera_distance_to_colls = GLVIS.config.three.camera_perspective.DISTANCE;
    else {

        var tmp_camera_vec = current_camera_pos.clone();
        tmp_camera_vec.sub(coll_circle_vec);
        camera_distance_to_colls = tmp_camera_vec.length() - coll_circle_radius;
    }


    var total_distance_to_center = coll_circle_radius + camera_distance_to_colls;






    var current_degrees_of_camera = this.getDegreeOnCameraSphere_(
            current_camera_pos.x,
            current_camera_pos.y,
            current_camera_pos.z);

    var curr_degree_h = current_degrees_of_camera.h;
    var curr_degree_v = current_degrees_of_camera.v;

    //HORIZONTAL

    //Add new delta
    curr_degree_h += degree_h_delta;
    var rad_h_to_set = curr_degree_h / (180 / Math.PI);

    //Get positions / Calculate back to world
    var new_pos = new THREE.Vector3(Math.sin(rad_h_to_set), 0, Math.cos(rad_h_to_set));


    //VERTICAL
    var rad_v_to_set = (curr_degree_v + degree_v_delta) / (180 / Math.PI);

    new_pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), -rad_h_to_set);

    //Apply new angle for vertical movement over the x-axis of the rotated vector
    new_pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), 0 - rad_v_to_set);

    //Rotate the vector back to position before vertical calculations
    new_pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), rad_h_to_set);

    //Denormalize
    new_pos.multiplyScalar(total_distance_to_center / new_pos.length());

    new_pos.sub(new THREE.Vector3(0, 0, coll_circle_radius));

    //Set new camera
    camera.position.set(new_pos.x, new_pos.y, new_pos.z);
    camera.lookAt(new THREE.Vector3(0, 0, -coll_circle_radius));
};


/**
 * Change distance from collection-circle center to a value that the camera
 * is on the sphere described by the coll-circle.
 * @param {bool} animation TRUE for animation
 */
GLVIS.NavigationHandler.prototype.moveCameraToCircleSphere = function (animation) {
    this.setDistanceFactor(1, animation);
};


/**
 * If camera is inside the circle return value < 1
 * If outside > 1
 * Else (on the circle) == 1
 * @returns {float}
 */
GLVIS.NavigationHandler.prototype.getDistanceFactor = function () {

    var coll_circle_radius = GLVIS.Scene.getCurrentScene().getCollectionPositionHandler().getCollCircleRadius();
    var camera_distance_to_colls = GLVIS.config.three.camera_perspective.DISTANCE;
    var total_distance_to_center = coll_circle_radius + camera_distance_to_colls;

    var camera = GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera();
    var current_camera_pos = camera.position.clone();
    var circle_center = new THREE.Vector3(0, 0, coll_circle_radius);
    var camera_center_vec = circle_center.clone().add(current_camera_pos);
    var current_length = camera_center_vec.length();

    var factor = current_length / total_distance_to_center;

    return factor;
};

/**
 * Move the camera to the direction of the center or away from it.
 * If factor is 1 the camera moves back to the camera-circle.
 * < 1 is inside the circle
 * > 1 outside the circle
 * @param {float} factor
 * @param {bool} animation
 * @param {function} cb
 */
GLVIS.NavigationHandler.prototype.setDistanceFactor = function (factor, animation, cb) {

    if (animation) {
        /** @type {GLVIS.Animation} anim **/
        var anim = GLVIS.Scene.getCurrentScene().getAnimation();
        //anim.finishCameraMovementAnimations();

        anim.register(
                this.animationconfig_.move_tocircle,
                factor,
                null,
                this.getDistanceFactor.bind(this),
                this.setDistanceFactor.bind(this),
                0,
                0.05,
                0.01,
                0.001,
                cb,
                true);

    } else {
        var coll_circle_radius = GLVIS.Scene.getCurrentScene().getCollectionPositionHandler().getCollCircleRadius();
        var camera_distance_to_colls = GLVIS.config.three.camera_perspective.DISTANCE;
        var total_distance_to_center = coll_circle_radius + camera_distance_to_colls;

        var camera = GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera();
        var current_camera_pos = camera.position.clone();
        var circle_center = new THREE.Vector3(0, 0, coll_circle_radius);
        var camera_center_vec = circle_center.clone().add(current_camera_pos);
        var current_length = camera_center_vec.length();

        camera_center_vec.multiplyScalar(factor / (current_length / total_distance_to_center));

        var new_camera_pos = camera_center_vec.clone().sub(circle_center);
        camera.position.set(new_camera_pos.x, new_camera_pos.y, new_camera_pos.z);
    }



};


/**
 * Move the scene's camera
 * @param {float | null} x
 * @param {type | null} y
 * @param {type | null} z
 */
GLVIS.NavigationHandler.prototype.moveCamera = function (x, y, z) {

    if (x === null || x === undefined)
        x = 0;
    if (y === null || y === undefined)
        y = 0;
    if (z === null || z === undefined)
        z = 0;

    var camera = GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera();
    camera.position.x += x;
    camera.position.y += y;
    camera.position.z += z;


    if (this.lookat_lock_)
        camera.lookAt(this.lookat_lock_);
};


/**
 * Lock the lookat vector for using the moveCamera method
 * @param {THREE.Vector3} vector
 */
GLVIS.NavigationHandler.prototype.lockLookAt = function (vector) {
    this.lookat_lock_ = vector;
};

/**
 * Unlock the lookat vector for using the moveCamera method
 */
GLVIS.NavigationHandler.prototype.unlockLookAt = function () {
    this.lookat_lock_ = null;
};

/**
 * Perform (absolute) zoom
 * @param {float} zoom_factor
 */
GLVIS.NavigationHandler.prototype.zoom = function (zoom_factor) {


    if (zoom_factor < 0)
        zoom_factor = 0;

    GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera().zoom = zoom_factor;
    GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera().updateProjectionMatrix();
};

/**
 * Getting the zoom level of the THREE.js Camera
 * @returns {Three.Camera.zoom}
 */
GLVIS.NavigationHandler.prototype.getZoomFactor = function () {
    var zoom = GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera().zoom;
    return zoom;
};

/**
 * Perform zoom relative
 * @param {float} delta_zoom_factor
 */
GLVIS.NavigationHandler.prototype.zoomDelta = function (delta_zoom_factor) {

    var zoom = GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera().zoom + (delta_zoom_factor / 100);

    //"this" may be unknown... 
    GLVIS.Scene.getCurrentScene().getNavigationHandler().zoom(zoom);
};


/**
 * At first move camera to the circle Sphere
 * Then move it horizontal and vertical to the correct position on the circle
 * @param {GLVIS.Collection} collection
 */
GLVIS.NavigationHandler.prototype.animatedCollectionFocus = function (collection) {


    //move 

    this.moveCameraToCircleSphere(true, function () {


        /**
         * STATUS OPEN!
         **/

    });

};


/**
 * 
 * @param {type} zoom_goal zoom level to reach
 * @param {type} callback_fct
 */
GLVIS.NavigationHandler.prototype.animatedZoom = function (zoom_goal, callback_fct) {

    var config = GLVIS.config.navigation.zoom.animated;
    var threshold = config.threshold;
    var pow = config.pow;
    var factor = config.speed_fct;

    var getter = this.getZoomFactor;
    var setter = this.zoomDelta;

    //GLVIS.Scene.getCurrentScene().getAnimation().finishAnimation(this.animationconfig_.zoom_id);

    GLVIS.Scene.getCurrentScene().getAnimation().register(
            this.animationconfig_.zoom_id,
            zoom_goal,
            null,
            getter,
            setter,
            0,
            factor,
            pow,
            threshold,
            callback_fct
            );
};

/**
 * Resetting both movement-animations
 */
GLVIS.NavigationHandler.prototype.resetAnimationMovement = function () {
    GLVIS.Scene.getCurrentScene().getAnimation().unregister(this.animationconfig_.move);
};

/**
 * Resetting the zoom-animation
 */
GLVIS.NavigationHandler.prototype.resetAnimationZoom = function () {
    GLVIS.Scene.getCurrentScene().getAnimation().unregister(this.animationconfig_.zoom_id);
};

/**
 * 
 * @param {GLVIS.Collection} collection
 * @param {function} callback_fct callback when ready
 */
GLVIS.NavigationHandler.prototype.focusCollection = function (collection, callback_fct) {

    var goal_dist_fct = GLVIS.config.collection.init_distance_fct;



    var move_goal = this.getDegreeOnCameraSphere_(
            collection.getPosition().x,
            collection.getPosition().y,
            collection.getPosition().z
            );

    GLVIS.Scene.getCurrentScene().getAnimation().register(
            this.animationconfig_.move,
            move_goal,
            null,
            this.getCurrentHVDegree.bind(this),
            this.moveCameraAroundCircleWObj.bind(this),
            0,
            0.1,
            0.01,
            0.1,
            function () {
                callback_fct();
            },
            false
            );


    this.setDistanceFactor(goal_dist_fct, true, function(){});




//ZOOM OUT
    /**
     if (this.getDistanceFactor() < goal_dist_fct) {
     this.setDistanceFactor(goal_dist_fct, true, function () {
     this.setCameraToCircle(collection.getPosition().x, collection.getPosition().y, collection.getPosition().z,
     null,
     true,
     cb
     );
     }.bind(this));
     } else {    //ZOOM IN
     this.setCameraToCircle(collection.getPosition().x, collection.getPosition().y, collection.getPosition().z,
     null,
     true,
     cb
     );
     
     }
     **/



};

GLVIS.NavigationHandler.prototype.defocusCollection = function () {
    this.setDistanceFactor(1, true, function () {
    });
};

/**
 * Moving camera to recommendation
 * 
 * Has its own workflow because the camera does NOT point to the center in the end
 * 
 * @param {GLVIS.Recommendation} rec
 */
GLVIS.NavigationHandler.prototype.focusRecommendation = function (rec) {

    var abs_pos = rec.getPosition(true);
    var abs_pos_vec = new THREE.Vector3(abs_pos.x, abs_pos.y, abs_pos.z);
    // @TODO: Calculate accurate offset



    var camera_distance = GLVIS.config.collection.recommendation.camera_distance;
    /*
     * The camera distance vector has the same direction as the connection between 
     * the circle-center and the collection
     */

    var coll_pos = rec.getCollection().getPosition();
    var coll_pos_vec = new THREE.Vector3(coll_pos.x, coll_pos.y, coll_pos.z);
    var circle_center_vec = new THREE.Vector3(0, 0, -GLVIS.Scene.getCurrentScene().getCollectionPositionHandler().getCollCircleRadius());
    var dir_vec = coll_pos_vec.clone().sub(circle_center_vec).normalize();
    var final_pos = abs_pos_vec.clone().add(dir_vec.multiplyScalar(camera_distance));
    var camera = GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera();
    this.lockLookAt(abs_pos_vec);
    var move_config = GLVIS.config.collection.recommendation.focus_animation.move;
    var move_setter = this.moveCamera;
    var move_getter_x = this.getPosX;
    var move_setter_param_x = 0;
    var move_getter_y = this.getPosY;
    var move_setter_param_y = 1;
    var move_getter_z = this.getPosZ;
    var move_setter_param_z = 2;
    var move_speed = move_config.speed;
    var move_pow = move_config.pow;
    var move_threshold = move_config.threshold;

    GLVIS.Scene.getCurrentScene().getAnimation().finishCameraMovementAnimations();

    //X
    GLVIS.Scene.getCurrentScene().getAnimation().register(
            this.animationconfig_.move_id_x,
            final_pos.x,
            null,
            move_getter_x,
            move_setter,
            move_setter_param_x,
            move_speed,
            move_pow,
            move_threshold,
            function () {
                this.lockLookAt(abs_pos_vec);
            }.bind(this)
            );
    //Y
    GLVIS.Scene.getCurrentScene().getAnimation().register(
            this.animationconfig_.move_id_y,
            final_pos.y,
            null,
            move_getter_y,
            move_setter,
            move_setter_param_y,
            move_speed,
            move_pow,
            move_threshold,
            function () {
                this.lockLookAt(abs_pos_vec);
            }.bind(this)
            );
    //Z
    GLVIS.Scene.getCurrentScene().getAnimation().register(
            this.animationconfig_.move_id_z,
            final_pos.z,
            null,
            move_getter_z,
            move_setter,
            move_setter_param_z,
            move_speed,
            move_pow,
            move_threshold,
            function () {
                this.lockLookAt(abs_pos_vec);
            }.bind(this)
            );
};
GLVIS.NavigationHandler.prototype.onMouseWheelMove = function (e, intersected_objects) {
    var is_positive = e.deltaY === 1 ? true : false;
    console.log(is_positive);
    for (var i = 0; i < intersected_objects.length; i++) {
        if (intersected_objects[i].object && intersected_objects[i].object.scene_obj) {
            var i_obj = intersected_objects[i].object.scene_obj;
            if (i_obj instanceof GLVIS.Collection) {
                /** @type{GLVIS.Collection} i_obj **/
                console.log("C " + i_obj.getId());
                if (is_positive) {
                    if (!i_obj.getRingRepresentation())
                        i_obj.createRingRepresentation();
                }
                else {

                    if (i_obj.getRingRepresentation())
                        i_obj.deleteRingRepresentation();
                }


                break;
            } else if (i_obj instanceof GLVIS.Recommendation) {
                /** @type{GLVIS.Recommendation} i_obj **/
                console.log("R " + i_obj.getId());
                if (is_positive) {
                    i_obj.focusAndZoom();
                }
                else {
                    i_obj.defocusAndZoomOut();
                }
                break;
            }
        }
    }
};
/**
 * Single getter for animation
 * @returns {float}
 */
GLVIS.NavigationHandler.prototype.getPosX = function () {
    return GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera().position.x;
};
/**
 * Single getter for animation
 * @returns {float}
 */
GLVIS.NavigationHandler.prototype.getPosY = function () {
    return GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera().position.y;
};
/**
 * Single getter for animation
 * @returns {float}
 */
GLVIS.NavigationHandler.prototype.getPosZ = function () {
    return GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera().position.z;
};

