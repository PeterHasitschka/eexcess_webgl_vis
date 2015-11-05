
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

    var media_folder = "../WebGlVisualization/media/";
    if (typeof (standalone_folder_prefix) !== "undefined")
        media_folder = "../../media/";

    var html = '<div id="webgl_toolbar_container">' +
            '        <div id="webgl_toolbar">' +
            '        </div>' +
            '        <a target="_blank" href="../WebGlVisualization/html/standalone/index.html"> Lade Standalone Version</a>' +
            '    </div>' +
            '    <div id="webgl_canvas_container">' +
            '        <p>Loading WebGL-Visualization...<br />' +
            '            Please wait!<br/>' +
            '            <img src="' + media_folder + 'ajax-loader.gif" alt="loading" /></p>' +
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

    var folder_prefix;
    if (typeof (standalone_folder_prefix) !== "undefined")
        folder_prefix = standalone_folder_prefix;
    else
        folder_prefix = "../WebGlVisualization/";


    if (!GLVIS.InitHandler.libs_loaded) {
        this.load_([
            // folder_prefix + "../Dashboard/libs/jquery-1.10.2.min.js",
            folder_prefix + "lib/underscore/underscore.js",
            folder_prefix + "lib/three.js/three.min.js",
            folder_prefix + "lib/jquery/fancybox/jquery.fancybox.pack.js",
            folder_prefix + "js/config.js",
            folder_prefix + "js/tools/debugger.js",
            folder_prefix + "js/tools/tools.js",
            folder_prefix + "js/tools/animationdebug.js",
            folder_prefix + "js/db/db_handler_indexed.js",
            folder_prefix + "js/db/db_handler_local.js",
            folder_prefix + "js/db/query.js",
            folder_prefix + "js/db/rec.js",
            folder_prefix + "js/db/query_creator.js",
            folder_prefix + "js/animation.js",
            folder_prefix + "js/webglhandler.js",
            folder_prefix + "js/interactionhandler.js",
            folder_prefix + "js/navigationhandler.js",
            folder_prefix + "js/forms.js",
            folder_prefix + "js/recdashboard/recdashboardhandler.js",
            folder_prefix + "js/recdashboard/toolbar.js",
            folder_prefix + "js/recdashboard/button.js",
            folder_prefix + "js/compare/direct.js",
            folder_prefix + "js/compare/highlight_recs_by_label.js",
            folder_prefix + "js/compare/webglobjects/direct_bar.js",
            folder_prefix + "js/webglobjects/collection_centernode.js",
            folder_prefix + "js/webglobjects/collection_plane.js",
            folder_prefix + "js/webglobjects/recnodes/rec_commonnode.js",
            folder_prefix + "js/webglobjects/recnodes/rec_detailnode.js",
            folder_prefix + "js/webglobjects/recnodes/detailnode_button.js",
            folder_prefix + "js/webglobjects/text.js",
            folder_prefix + "js/filter/filterhandler.js",
            folder_prefix + "js/filter/filter.js",
            folder_prefix + "js/collection.js",
            folder_prefix + "js/recommendation.js",
            folder_prefix + "js/ringrep/coll_ringsegment.js",
            folder_prefix + "js/ringrep/ringrepresentation.js",
            folder_prefix + "js/ringrep/tree.js",
            folder_prefix + "js/position/recommendation/distributed.js",
            folder_prefix + "js/position/recommendation/ringrep.js",
            //folder_prefix + "js/position/collection/linear.js",
            folder_prefix + "js/position/collection/circular.js",
            folder_prefix + "js/position/collection/circletype/ring.js",
            folder_prefix + "js/position/collection/circletype/bow.js",
            folder_prefix + "js/webglobjects/connection/collection_rec_line.js",
            folder_prefix + "js/webglobjects/connection/collection_collection_line.js",
            folder_prefix + "js/webglobjects/connection/rec_rec_spline.js",
            folder_prefix + "js/recconnector.js",
            folder_prefix + "js/scene.js"
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
};
