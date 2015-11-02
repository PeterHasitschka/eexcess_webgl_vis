
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

    this.appendHtmlStuff(root_element);
    this.loadFiles(root_element, path, cb);

    this.load_tries = 0;
    this.max_load_tries = 3;

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
 * If an error occours in the callback after loading where the scene gets created
 * this method will be recalled again (until a limit is reached).
 * This is necessary due to the Modernizr callback that may come before the classes
 * may be loaded.
 * 
 * @param {object} root_element jQuery element
 * @param {string} path prefix for all files 
 * @param {function} cb Callback after loading
 * @returns {GLVIS.InitHandler.loadFiles}
 */
GLVIS.InitHandler.loadFiles = function (root_element, path, cb) {

    if (!GLVIS.InitHandler.libs_loaded) {
        this.load_([
            "libs/jquery-1.10.2.min.js",
            "../WebGlVisualization/lib/underscore/underscore.js",
            "../WebGlVisualization/lib/three.js/three.min.js",
            "../WebGlVisualization/js/config.js",
            "../WebGlVisualization/js/tools/debugger.js",
            "../WebGlVisualization/js/tools/tools.js",
            "../WebGlVisualization/js/tools/animationdebug.js",
            "../WebGlVisualization/js/db/db_handler_indexed.js",
            "../WebGlVisualization/js/db/db_handler_local.js",
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
                //Callback after all files where loaded
                        function () {
                            GLVIS.Debugger.debug("InitHandler",
                                    "finished calling js files for webglvis-plugin",
                                    3);

                            //Increment loading tries
                            this.load_tries++;

                            /**
                             * There may be some errors due to not complete init of the loaded classes.
                             * Give it some tries again to finish loading by recalling the loadFiles method
                             */
                            try {

                                GLVIS.InitHandler.initScene(this.scene, this.db_handler, cb);
                            } catch (Exception) {

                                if (this.load_tries < this.max_load_tries) {
                                    GLVIS.Debugger.debug("InitHandler",
                                            "Error in creating scene. May be caused by not ready loaded file. Trying to load file once more!",
                                            3);
                                    //Recall
                                    this.loadFiles(root_element, path, cb);
                                    return;
                                }
                                /**
                                 * Too much tries. The error in creating the scene may be caused by something else
                                 */
                                else {
                                    GLVIS.Debugger.debug("InitHandler",
                                            "Tried to create scene after loading files " + this.load_tries + " time! Stopping now!",
                                            1);
                                    console.error("Error creating scene!", Exception);
                                    return;
                                }
                            }
                            GLVIS.InitHandler.libs_loaded = true;
                        }.bind(this));
            }
    else {
        GLVIS.InitHandler.initScene(this.scene, this.db_handler, cb);
    }
};

/**
 * Wrapper for specific loading method. Require.js made problems in new dashboard
 * So switch to Modernizr.
 * 
 * @param {array[string]} files
 * @param {function} cb Callback
 */
GLVIS.InitHandler.load_ = function (files, cb) {

    if (!Modernizr) {
        require(files, cb);
    } else {
        Modernizr.load({
            load: files,
            callback: function (d) {
                return;
            },
            complete: function (d) {
                cb();
                return;
            }
        });
    }
};

/**
 * Create DB-Handler and Scene. 
 * @param {GLVIS.Scene} scene
 * @param {GLVIS.DbHandlerIndexedDb} db_handler
 * @param {function} cb callback
 */
GLVIS.InitHandler.initScene = function (scene, db_handler, cb) {

    scene = new GLVIS.Scene(jQuery(GLVIS.config.rec_dashboard.selector));

    db_handler = new GLVIS.DbHandlerLocalStorage();

    var collections = db_handler.getCollections();
    for (var q_count = 0; q_count < collections.length; q_count++) {
        scene.addCollection(collections[q_count]);
    }

    scene.initCollectionNetwork();
    GLVIS.Scene.getCurrentScene().getWebGlHandler().getCanvas().show();

    GLVIS.Scene.animate();

    if (cb)
        cb();
};


GLVIS.InitHandler.cleanup = function () {

    GLVIS.Debugger.debug("InitHandler",
            "Cleaning up!",
            3);

    delete GLVIS.Scene.getCurrentScene();
    GLVIS.Scene.current_scene = null;

    delete GLVIS.DbHandlerIndexedDb.getCurrentDbHandlerIndexedDb();
    GLVIS.DbHandlerIndexedDb.current_db_handler_ = null;
};