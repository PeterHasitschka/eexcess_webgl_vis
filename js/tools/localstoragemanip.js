var IQHN = IQHN || {};

IQHN.LocalStorageManipulator = function () {

    var container_to_fill = jQuery('#eexcess_controls');

    var link_exp = jQuery('<a/>', {
        text: "Storage exportieren",
        href: "javascript:IQHN.Scene.getCurrentScene().localstoragemanipulator.export()"
    }).css("float", "left");
    ;
    container_to_fill.append(link_exp);


    var link_imp = jQuery('<a/>', {
        text: "Storage importieren",
        href: "javascript:IQHN.Scene.getCurrentScene().localstoragemanipulator.import()"
    }).css("float", "left");
    container_to_fill.append(link_imp);

    var text_field_import = jQuery('<textarea/>', {
        'id': 'localstoragemanip_importdata'
    }).css("float", "left").css("width", "167").css("height", "200");

    container_to_fill.append(text_field_import);
};

IQHN.LocalStorageManipulator.prototype.export = function () {


    var archive = [];
     jQuery('#localstoragemanip_importdata').val("PLEASE WAIT....");
    for (var i = 0; i < localStorage.length; i++) {

        var key = localStorage.key(i);

        if (key.indexOf("eexcess_query_") < 0)
            continue;

        var idx = parseInt(key.replace("eexcess_query_", ""));
        archive[idx] = localStorage.getItem(key);
    }

    var export_val = JSON.stringify(archive);
    
    jQuery('#localstoragemanip_importdata').val(export_val);

};



