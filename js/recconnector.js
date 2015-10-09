var GLVIS = GLVIS || {};


/**
 * 
 * @param {GLVIS.Scene} scene
 */
GLVIS.RecConnector = function (scene) {
    GLVIS.Debugger.debug("RecConnector", "RecConnector created", 5);
    this.scene_ = scene;
    this.splines_ = [];
};

/**
 * Connect all recommendations that have the same data over the scene
 * @param {GLVIS.Recommendation} recommendation
 */
GLVIS.RecConnector.prototype.connectSameRecs = function (recommendation) {

    GLVIS.Debugger.debug("RecConnector", ["Connecting recommendations for rec", recommendation], 6);

    var colls = this.scene_.getCollections();

    var spline = new GLVIS.ConnectionRecRecSpline();

    var e_data = recommendation.getEexcessData();
    var e_id = e_data.result.id;

    _.each(colls, function (collection) {

        var coll_recs = collection.getRecommendations();

        _.each(coll_recs, function (foreign_rec) {

            if (recommendation.getId() === foreign_rec.getId())
                return;

            var foreign_e_data = foreign_rec.getEexcessData();
            var foreign_e_id = foreign_e_data.result.id;

            if (e_id === foreign_e_id) {
                spline.addRec(foreign_rec);
            }
        });
    });

    if (!spline.getRecs().length)
        return;

    spline.addRec(recommendation);
    spline.calculateSpline();

    this.splines_.push(spline);
};

/*
 * Holding all collections that have activated connections on all their recs
 */
GLVIS.RecConnector.activatedAtCollections = [];

/*
 * Holding all recs where the connections are activated
 */
GLVIS.RecConnector.activatedAtSingleRecs = [];