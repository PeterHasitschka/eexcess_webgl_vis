var GLVIS = GLVIS || {};


GLVIS.CollectionPosCircularTypeBow = function () {
};


GLVIS.CollectionPosCircularTypeBow.prototype.getAddEmptySpaces = function (orig_num) {
    return parseInt(orig_num * 1.4);
};


GLVIS.CollectionPosCircularTypeBow.prototype.getCollCircleRadius = function () {
    return GLVIS.config.scene.circle_radius_bow;
};