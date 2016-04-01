var IQHN = IQHN || {};


IQHN.CollectionPosCircularTypeBow = function () {
};


IQHN.CollectionPosCircularTypeBow.prototype.getAddEmptySpaces = function (orig_num) {
    var coll_dist_degree = IQHN.config.scene.coll_distance_degree || 1;
    return (360 / coll_dist_degree) - parseInt(orig_num);
};


IQHN.CollectionPosCircularTypeBow.prototype.getCollCircleRadius = function () {
    return IQHN.config.scene.circle_radius_bow;
};