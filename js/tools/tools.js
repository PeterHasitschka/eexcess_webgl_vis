var IQHN = IQHN || {};
/**
 * Some nice little helpers
 */
IQHN.Tools = {};
/**
 * Getting the angle (radians) of something by passing the coordinates
 * @param {float} x
 * @param {float} y
 * @returns {float}
 */
IQHN.Tools.getRadFromPos = function (x, y) {
    var rad = Math.atan2(y, x);
    while (rad < 0)
        rad += (Math.PI * 2);
    while (rad > Math.PI * 2)
        rad -= Math.PI * 2;
    return rad;
};
/**
 * Getting the x and y position of something by passing the angle and the distance
 * @param {float} rad Radians
 * @param {float} distance Distance
 * @returns {object} Object holding x and y
 */
IQHN.Tools.getPosFromRad = function (rad, distance) {

    while (rad < 0)
        rad += (Math.PI * 2);
    while (rad > Math.PI * 2)
        rad -= Math.PI * 2;
    var pos_x = Math.cos(rad) * distance;
    var pos_y = Math.sin(rad) * distance;
    return {x: pos_x, y: pos_y};
};
/**
 * Rotate vecotr via a specific axis
 * @param {integer} axis 1 -> X, 2 -> Y, 3 -> Z
 * @param {float} degree
 * @param {THREE.Vector3} point
 * @return {THREE.Vector3} Rotaded vector
 */
IQHN.Tools.getRotation = function (axis, degree, point) {

    var rad = degree / 360 * 2 * Math.PI;
    switch (axis) {

        case 2 :
            var axis = new THREE.Vector3(0, 1, 0);
            var rotated_point = point.applyAxisAngle(axis, rad);
            return  rotated_point;
        default:
            throw ("Rotation around this axis not implemented yet!");
    }

};
IQHN.Tools.MultVarOps = {
    add: function (a, b) {

        if (typeof a !== 'object' || typeof b !== 'object')
            return a + b;
        var c = {};
        for (var k in a) {
            c[k] = a[k] + b[k];
        }

        return c;
    },
    sub: function (a, b) {

        if (typeof a !== 'object' || typeof b !== 'object')
            return a - b;
        var c = {};
        for (var k in a) {
            c[k] = a[k] - b[k];
        }

        return c;
    },
    mult: function (a, b) {

        if (typeof a !== 'object' && typeof b !== 'object')
            return a * b;
        var c = {};

        if (typeof a !== 'object')
            for (var k in b) {
                c[k] = a * b[k];
            }
        else if (typeof b !== 'object')
            for (var k in a) {
                c[k] = a[k] * b;
            }
        else
            for (var k in a) {
                c[k] = a[k] * b[k];
            }
        return c;
    },
    div: function (a, b) {

        if (typeof a !== 'object' || typeof b !== 'object')
            return a / b;
        var c = {};
        if (typeof a !== 'object')
            for (var k in b) {
                c[k] = a / b[k];
            }
        else if (typeof b !== 'object')
            for (var k in a) {
                c[k] = a[k] / b;
            }
        else
            for (var k in a) {
                c[k] = a[k] / b[k];
            }

        return c;
    },
    length: function (a) {

        if (typeof a !== 'object')
            return a;
        var c = 0;
        for (var k in a) {
            c += Math.pow(a[k], 2);
        }
        return parseFloat(Math.sqrt(c));
    },
    gt: function (a, b) {
        if (typeof a !== 'object' || typeof b !== 'object')
            return a > b;

        return this.length(a) > this.length(b);
    },
    /**
     * 
     *  
     *  Test stuff
     */
    test_param: {
        a: 0,
        b: 0,
        c: 0
    },
    setTestParam: function (t) {
        console.log("SET TEST", t);
        this.test_param = t;
    },
    getTestParam: function () {
        return this.test_param;
    },
    testAnim: function () {
        var goal = {
            h: 10,
            v: 0
        };

        /** @var {IQHN.NavigationHandler} nh **/
        var nh = IQHN.Scene.getCurrentScene().getNavigationHandler();


        IQHN.Scene.getCurrentScene().getAnimation().register(
                "test_anim",
                goal,
                null,
                nh.getCurrentHVDegree.bind(nh),
                nh.moveCameraAroundCircleWObj.bind(nh),
                0,
                0.1,
                0.01,
                0.1,
                function () {
                    console.log("ready");
                },
                false
                );
    }
};
