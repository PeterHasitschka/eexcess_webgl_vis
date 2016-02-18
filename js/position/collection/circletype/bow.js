var IQHN = IQHN || {};


IQHN.CollectionPosCircularTypeBow = function () {
};


IQHN.CollectionPosCircularTypeBow.prototype.getAddEmptySpaces = function (orig_num) {
    return parseInt(orig_num * IQHN.config.scene.bow_empty_spaces_factor);
};


IQHN.CollectionPosCircularTypeBow.prototype.getCollCircleRadius = function () {
    return IQHN.config.scene.circle_radius_bow;
};