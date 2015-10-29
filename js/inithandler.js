
var GLVIS = GLVIS || {};

GLVIS.InitHandler = function () {
};

GLVIS.InitHandler.libs_loaded = false;


/**
 * 
 * @param {type} root_element
 * @param {type} path_to_webglvisualization_folder
 * @param {function} cb callback
 * @returns {undefined}
 */
GLVIS.InitHandler.init = function (root_element, path_to_webglvisualization_folder, cb) {

    var path = path_to_webglvisualization_folder;

    console.log(root_element);
    if (false)
        //Load HTML-Credentials via AJAX
        jQuery.get(
                path + "html/recdashboard/index.html", function (data) {

                    root_element.append(data);
                    this.loadFiles(root_element, path, cb);
                }.bind(this)
                );
    else {
        this.appendHtmlStuff(root_element);
        this.loadFiles(root_element, path, cb);
    }
};



GLVIS.InitHandler.appendHtmlStuff = function (root_element) {


    var html = '<div id="webgl_toolbar_container">' +
            '' +
            '        <div id="webgl_toolbar">' +
            '' +
            '        </div>' +
            '' +
            '' +
            '        <a target="_blank" href="/visualizations/WebGlVisualization/html/standalone/index.html"> Lade Standalone Version</a>' +
            '    </div>' +
            '    <div id="webgl_canvas_container">' +
            '        <p>Loading WebGL-Visualization...<br />' +
            '            Please wait!<br/>' +
            '            <img src="/visualizations/WebGlVisualization/media/ajax-loader.gif" alt="loading" /></p>' +
            '    </div>';

    root_element.append(html);


};

GLVIS.InitHandler.loadFiles = function (root_element, path, cb) {

    /**
     * Run require in two steps... Otherwise it may happen
     * randomly that three.js doesn't get loaded until the scene
     * gets created.
     */
    if (!GLVIS.InitHandler.libs_loaded) {
        this.load_([
            path + "../../../libs/jquery-1.10.1.min.js",
            path + "../../../libs/jquery-mousewheel/jquery.mousewheel.min.js",
            path + "lib/underscore/underscore.js",
            path + "lib/three.js/three.min.js"],
                function () {
                    this.load_([
                        path + "js/config.js",
                        path + "js/tools/debugger.js",
                        path + "js/tools/tools.js",
                        path + "js/tools/animationdebug.js",
                        path + "js/db/db_handler.js",
                        path + "js/db/query.js",
                        path + "js/db/rec.js",
                        path + "js/db/query_creator.js",
                        path + "js/animation.js",
                        path + "js/webglhandler.js",
                        path + "js/interactionhandler.js",
                        path + "js/navigationhandler.js",
                        path + "js/forms.js",
                        path + "js/recdashboard/recdashboardhandler.js",
                        path + "js/recdashboard/toolbar.js",
                        path + "js/recdashboard/button.js",
                        path + "js/compare/direct.js",
                        path + "js/compare/highlight_recs_by_label.js",
                        path + "js/compare/webglobjects/direct_bar.js",
                        path + "js/webglobjects/collection_centernode.js",
                        path + "js/webglobjects/collection_plane.js",
                        path + "js/webglobjects/recnodes/rec_commonnode.js",
                        path + "js/webglobjects/recnodes/rec_detailnode.js",
                        path + "js/webglobjects/recnodes/detailnode_button.js",
                        path + "js/webglobjects/text.js",
                        path + "js/filter/filterhandler.js",
                        path + "js/filter/filter.js",
                        path + "js/collection.js",
                        path + "js/recommendation.js",
                        path + "js/ringrep/coll_ringsegment.js",
                        path + "js/ringrep/ringrepresentation.js",
                        path + "js/ringrep/tree.js",
                        path + "js/position/recommendation/distributed.js",
                        path + "js/position/recommendation/ringrep.js",
                        //path + "js/position/collection/linear.js",
                        path + "js/position/collection/circular.js",
                        path + "js/position/collection/circletype/ring.js",
                        path + "js/position/collection/circletype/bow.js",
                        path + "js/webglobjects/connection/collection_rec_line.js",
                        path + "js/webglobjects/connection/collection_collection_line.js",
                        path + "js/webglobjects/connection/rec_rec_spline.js",
                        path + "js/recconnector.js",
                        path + "js/scene.js",
                        path + "../../../common_js/storage.js",
                        path + "../Vis-Template/js/utils.js", //Important to prevent .scrollTo-Bug
                        path + "../Vis-Template/js/colorpicker.js", //Important to prevent .colorPicker-Bug
                        path + "../Vis-Template/js/accordion-and-dropdown.js"   //Important to prevent .dropdown-Bug
                    ],
                            function () {
                                GLVIS.Debugger.debug("InitHandler",
                                        "finished calling js files for webglvis-plugin",
                                        3);

                                GLVIS.InitHandler.libs_loaded = true;

                                //Recall this function
                                GLVIS.InitHandler.init(root_element, path, cb);
                            }.bind(this));
                }.bind(this)
                );
    }
    else {
        GLVIS.InitHandler.initScene(this.scene, this.db_handler, cb);
    }
};


GLVIS.InitHandler.load_ = function (files, cb) {
    require(files, cb);

};

/**
 * Create DB-Handler and Scene. 
 * @param {GLVIS.Scene} scene
 * @param {GLVIS.DbHandler} db_handler
 * @param {function} cb callback
 */
GLVIS.InitHandler.initScene = function (scene, db_handler, cb) {

    scene = new GLVIS.Scene(jQuery(GLVIS.config.rec_dashboard.selector));
    db_handler = new GLVIS.DbHandler();
    var queries_to_add = null;
    db_handler.loadQueriesAndRecs(function () {

        GLVIS.Debugger.debug("InitHandler",
                "Query-Data loaded and processed cb",
                3);

        var queries_to_add = db_handler.fetchQueries(GLVIS.config.scene.queries_to_fetch);

        for (var q_count = 0; q_count < queries_to_add.length; q_count++) {
            scene.addCollection(queries_to_add[q_count]);
        }

        scene.initCollectionNetwork();
        GLVIS.Scene.getCurrentScene().getWebGlHandler().getCanvas().show();

        GLVIS.Scene.animate();

        if (cb)
            cb();
    });
};


GLVIS.InitHandler.cleanup = function () {

    GLVIS.Debugger.debug("InitHandler",
            "Cleaning up!",
            3);

    delete GLVIS.Scene.getCurrentScene();
    GLVIS.Scene.current_scene = null;

    delete GLVIS.DbHandler.getCurrentDbHandler();
    GLVIS.DbHandler.current_db_handler_ = null;
};