var canvas1, textElm;

var standalone_folder_prefix = "../../";

jQuery(document).ready(function () {
    GLVIS.InitHandler.init(jQuery('body'), function () {
        GLVIS.Debugger.debug("standalone", "Finished initializing scene. Callback", 3);
    });
});