
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
GLVIS.InitHandler.init = function (root_element, cb) {

    var path = "../WebGlVisualization/";

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


/**
 * Adding html stuff to the root element.
 * It's not possible anymore to use a .html file via jQuery-get due to XHR Problems
 * when using the dashboard in a standalone environment without extension or server
 * @param {object} root_element Jquery object
 */
GLVIS.InitHandler.appendHtmlStuff = function (root_element) {

    var html = '<div id="webgl_toolbar_container">' +
            '        <div id="webgl_toolbar">' +
            '        </div>' +
            '        <a target="_blank" href="../WebGlVisualization/html/standalone/index.html"> Lade Standalone Version</a>' +
            '    </div>' +
            '    <div id="webgl_canvas_container">' +
            '        <p>Loading WebGL-Visualization...<br />' +
            '            Please wait!<br/>' +
            '            <img src="../WebGlVisualization/media/ajax-loader.gif" alt="loading" /></p>' +
            '    </div>';

    root_element.append(html);

};

/**
 * Loading all necessary JS Files for the Plugin
 * 
 * @param {object} root_element jQuery element
 * @param {string} path prefix for all files 
 * @param {function} cb Callback after loading
 * @returns {GLVIS.InitHandler.loadFiles}
 */
GLVIS.InitHandler.loadFiles = function (root_element, path, cb) {

    /**
     * Run require in two steps... Otherwise it may happen
     * randomly that three.js doesn't get loaded until the scene
     * gets created.
     */
    if (!GLVIS.InitHandler.libs_loaded) {
        this.load_([
            "libs/jquery-1.10.2.min.js",
            "../WebGlVisualization/lib/underscore/underscore.js",
            "../WebGlVisualization/lib/three.js/three.min.js"],
                function () {
                    this.load_([
                        "../WebGlVisualization/js/config.js",
                        "../WebGlVisualization/js/tools/debugger.js",
                        "../WebGlVisualization/js/tools/tools.js",
                        "../WebGlVisualization/js/tools/animationdebug.js",
                        "../WebGlVisualization/js/db/db_handler.js",
                        "../WebGlVisualization/js/db/query.js",
                        "../WebGlVisualization/js/db/rec.js",
                        "../WebGlVisualization/js/db/query_creator.js",
                        "../WebGlVisualization/js/animation.js",
                        "../WebGlVisualization/js/webglhandler.js",
                        "../WebGlVisualization/js/interactionhandler.js",
                        "../WebGlVisualization/js/navigationhandler.js",
                        "../WebGlVisualization/js/forms.js",
                        "../WebGlVisualization/js/recdashboard/recdashboardhandler.js",
                        "../WebGlVisualization/js/recdashboard/toolbar.js",
                        "../WebGlVisualization/js/recdashboard/button.js",
                        "../WebGlVisualization/js/compare/direct.js",
                        "../WebGlVisualization/js/compare/highlight_recs_by_label.js",
                        "../WebGlVisualization/js/compare/webglobjects/direct_bar.js",
                        "../WebGlVisualization/js/webglobjects/collection_centernode.js",
                        "../WebGlVisualization/js/webglobjects/collection_plane.js",
                        "../WebGlVisualization/js/webglobjects/recnodes/rec_commonnode.js",
                        "../WebGlVisualization/js/webglobjects/recnodes/rec_detailnode.js",
                        "../WebGlVisualization/js/webglobjects/recnodes/detailnode_button.js",
                        "../WebGlVisualization/js/webglobjects/text.js",
                        "../WebGlVisualization/js/filter/filterhandler.js",
                        "../WebGlVisualization/js/filter/filter.js",
                        "../WebGlVisualization/js/collection.js",
                        "../WebGlVisualization/js/recommendation.js",
                        "../WebGlVisualization/js/ringrep/coll_ringsegment.js",
                        "../WebGlVisualization/js/ringrep/ringrepresentation.js",
                        "../WebGlVisualization/js/ringrep/tree.js",
                        "../WebGlVisualization/js/position/recommendation/distributed.js",
                        "../WebGlVisualization/js/position/recommendation/ringrep.js",
                        //"../WebGlVisualization/js/position/collection/linear.js",
                        "../WebGlVisualization/js/position/collection/circular.js",
                        "../WebGlVisualization/js/position/collection/circletype/ring.js",
                        "../WebGlVisualization/js/position/collection/circletype/bow.js",
                        "../WebGlVisualization/js/webglobjects/connection/collection_rec_line.js",
                        "../WebGlVisualization/js/webglobjects/connection/collection_collection_line.js",
                        "../WebGlVisualization/js/webglobjects/connection/rec_rec_spline.js",
                        "../WebGlVisualization/js/recconnector.js",
                        "../WebGlVisualization/js/scene.js"
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

/**
 * Wrapper for specific loading method. Require.js makes problems
 * Plans to switch to Modernizr.
 * 
 * @param {array[string]} files
 * @param {function} cb Callback
 */
GLVIS.InitHandler.load_ = function (files, cb) {

    if (!Modernizr) {
        require(files, cb);
    } else {
        Modernizr.load({
            test: files,
            load: files,
            complete: function () {
                cb();
                return;
            }
        });
    }
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