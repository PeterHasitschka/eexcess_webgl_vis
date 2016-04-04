
var IQHN = IQHN || {};

IQHN.InitHandler = function () {
    this.bookmarks_to_vis = null;
};

IQHN.InitHandler.setBookmarks = function (bms) {
    this.bookmarks_to_vis = bms;
};

IQHN.InitHandler.libs_loaded = false;
IQHN.InitHandler.is_loaded = false;

/**
 * 
 * @param {type} root_element
 * @param {type} path_to_webglvisualization_folder
 * @param {function} cb callback
 * @param {object | null} bookmarks If not empty, those bookmarks are getting shown
 * @returns {undefined}
 */
IQHN.InitHandler.init = function (root_element, cb, bookmarks) {
    
    if (bookmarks)
        this.bookmarks_to_vis = bookmarks;
    else
        this.bookmarks_to_vis = null;

    var path = "../WebGlVisualization/";
    
    this.appendHtmlStuff(root_element);
    
    if (IQHN.Scene)
        IQHN.InitHandler.initScene(this.scene, this.db_handler, cb);
    else 
        this.loadFiles(root_element, path, cb);

};


/**
 * Adding html stuff to the root element.
 * It's not possible anymore to use a .html file via jQuery-get due to XHR Problems
 * when using the dashboard in a standalone environment without extension or server
 * @param {object} root_element Jquery object
 */
IQHN.InitHandler.appendHtmlStuff = function (root_element) {

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
 * @returns {IQHN.InitHandler.loadFiles}
 */
IQHN.InitHandler.loadFiles = function (root_element, path, cb) {

    var folder_prefix;
    if (typeof (standalone_folder_prefix) !== "undefined")
        folder_prefix = standalone_folder_prefix;
    else
        folder_prefix = "../WebGlVisualization/";


    if (!IQHN.InitHandler.libs_loaded) {
        this.load_([
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
            folder_prefix + "js/db/bookmark_handler.js",
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
                            this.afterFilesLoaded_(root_element, path, cb);
                        }.bind(this));
            }
    else {
        IQHN.InitHandler.initScene(this.scene, this.db_handler, cb);
    }
};

/**
 * Called after all files where loaded
 * @param {type} root_element
 * @param {type} path
 * @param {type} cb
 * @returns {undefined}
 */
IQHN.InitHandler.afterFilesLoaded_ = function (root_element, path, cb) {
    IQHN.Debugger.debug("InitHandler",
            "finished calling js files for webglvis-plugin",
            3);

    IQHN.InitHandler.initScene(this.scene, this.db_handler, cb);

    IQHN.InitHandler.libs_loaded = true;
};

/**
 * Wrapper for specific loading method. Require.js made problems in new dashboard
 * So switch to Modernizr.
 * 
 * @param {array[string]} files
 * @param {function} cb Callback
 */
IQHN.InitHandler.load_ = function (files, cb) {

    if (!Modernizr) {
        require(files, cb);
    } else {
        Modernizr.load({
            load: files,
            test: files,
            callback: function (d) {
                return;
            },
            complete: function (d) {
                var millisecs = 200;
                IQHN.Debugger.debug("InitHandler", "Waiting for " + millisecs + "ms to complete class initializations...", 3);
                setTimeout(function () {
                    IQHN.Debugger.debug("InitHandler", "Finished waiting", 3);
                    cb();
                }, millisecs);

                return;
            }
        });
    }
};

/**
 * Create DB-Handler and Scene. 
 * @param {IQHN.Scene} scene
 * @param {IQHN.DbHandlerIndexedDb} db_handler
 * @param {function} cb callback
 */
IQHN.InitHandler.initScene = function (scene, db_handler, cb) {
    
    if (IQHN.Scene.getCurrentScene())
        this.cleanup();
    
    scene = new IQHN.Scene(jQuery(IQHN.config.rec_dashboard.selector));

    var collections = null;
    if (!this.bookmarks_to_vis) {
        db_handler = new IQHN.DbHandlerLocalStorage();
        collections = db_handler.getCollections();
    }
    else {
        var bm_handler = new IQHN.BookmarkHandler(this.bookmarks_to_vis);
        collections = bm_handler.getCollections();
    }

    if (!collections.length) {
        
        var info = jQuery('<div/>', {
            id: "webglvis_emptysceneinfocontainer"
        }).append(
                jQuery('<p/>', {
                    text : "No queries or bookmarks available to visualize.\n\
                        Please do a search-query or create a bookmark-collection first."
                })
            );
        
        jQuery('#eexcess_canvas').append(info);
        return;
    }



    for (var q_count = 0; q_count < collections.length; q_count++) {
        scene.addCollection(collections[q_count]);
    }

    scene.initCollectionNetwork();
    IQHN.Scene.getCurrentScene().getWebGlHandler().getCanvas().show();

    IQHN.Scene.animate();

    if (cb)
        cb();
    IQHN.InitHandler.is_loaded = true;
};


IQHN.InitHandler.cleanup = function () {

    IQHN.Debugger.debug("InitHandler",
            "Cleaning up!",
            3);
    
    IQHN.Scene.getCurrentScene().cleanup();
    delete IQHN.Scene.getCurrentScene();
    IQHN.Scene.current_scene = null;

    IQHN.InitHandler.is_loaded = false;
};
