var IQHN = IQHN || {};


/**
 * 
 * @param {IQHN.Scene} scene
 */
IQHN.RecConnector = function (scene) {
    IQHN.Debugger.debug("RecConnector", "RecConnector created", 5);
    this.scene_ = scene;
    this.splines_ = [];
};

/**
 * Connect all recommendations that have the same data over the scene
 * @param {IQHN.Recommendation} recommendation
 */
IQHN.RecConnector.prototype.connectSameRecs = function (recommendation) {

    IQHN.Debugger.debug("RecConnector", ["Connecting recommendations for rec", recommendation], 6);

    var colls = this.scene_.getCollections();

    var spline = new IQHN.ConnectionRecRecSpline();

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
IQHN.RecConnector.activatedAtCollections = [];

/*
 * Holding all recs where the connections are activated
 */
IQHN.RecConnector.activatedAtSingleRecs = [];