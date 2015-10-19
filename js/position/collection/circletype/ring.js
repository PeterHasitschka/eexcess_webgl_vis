var GLVIS = GLVIS || {};


GLVIS.CollectionPosCircularTypeRing = function () {
};

/**
 * 
 * @param {integer} index Signed Int. 0 is center -1 is next left 1 is next right etc...
 * @param {integer} numindizies Maximum number of collections to set pos
 * @returns {array}
 */
GLVIS.CollectionPosCircularTypeRing.prototype.getPosAndRot = function (index, numindizies) {

    var rad_step = (Math.PI * 2) / (numindizies);

    var curr_rad = index * rad_step + Math.PI / 2;

    var radius = GLVIS.config.scene.circle_radius;
    var pos = GLVIS.Tools.getPosFromRad(curr_rad, radius);

    var degree = (curr_rad - Math.PI / 2) * 180 / Math.PI * -1;
    return {x: pos.x, z: pos.y - radius, degree: degree};
};