var GLVIS = GLVIS || {};



GLVIS.Forms = function (scene) {
    this.scene_ = scene;
};

/**
 * Create an info-box showing details of a specific recommendation 
 * @param {GLVIS.Recommendation} rec
 */
GLVIS.Forms.prototype.createFormRecInfo = function (rec) {

    var e_data = rec.getEexcessData();

    /**
     * Build HTML Stuff here
     */
    var title = e_data.result.title;
    var content_title = "<h2>Result-Details</h2><h3>" + title + "</h3>";

    var data = {
        "ID": rec.getId(),
        "Link": "<a target='__blank' href='" + e_data.result.uri + "'>Open in new Tab</a>",
        "Image": e_data.result.previewImage ? ("<img src='" + e_data.result.previewImage + "' title='" + title + "' alt='" + title + "'/>") : null
    };

    var content_left = "<h4>Infos</h4>";
    for (var key in data) {

        if (data[key] === null)
            continue;

        var data_key_html = "<div class='webgl_rec_infobox_data_key'>" + key + "</div>";
        var data_val_html = "<div class='webgl_rec_infobox_data_val'>" + data[key] + "</div>";
        content_left += ("<div class='webgl_rec_infobox_data_row'>" + data_key_html + data_val_html +
                "</div>");
    }
    var content_datacontainer1 = "<div style='float:left; width:49%' class='webgl_rec_infobox_datacontainer'>" + content_left + "</div>";


    var content_right = "<h4>Facets / Filters</h4>";

    var facets = e_data.result.facets;

    for (var key in facets) {
        var data_key_html = "<div class='webgl_rec_infobox_data_key'>" + key + "</div>";

        var val = facets[key];
        if (val.indexOf("http") === 0)
            val = "<a c href='" + val + "' target='__blank'>Open in new Tab</a>";

        var filter_applied = GLVIS.Scene.getCurrentScene().getFilterHandler().isFilterApplied(key, facets[key]);


        var filter_button_a = "<a f_key='" + key + "' f_val='" + facets[key] + "' rec_id=" + rec.getId() +
                " class='webgl_rec_infobox_data_filterbutton webgl_rec_infobox_data_filterapply' " +
                " style='display:" + (filter_applied ? "none" : "inline") + "'" +
                "title='Use as filter' href='#'></a>";
        var filter_button_r = "<a f_key='" + key + "' f_val='" + facets[key] + "' rec_id=" + rec.getId() +
                " class='webgl_rec_infobox_data_filterbutton webgl_rec_infobox_data_filterremove' " +
                " style='display:" + (!filter_applied ? "none" : "inline") + "'" +
                "title='Remove filter' href='#'></a>";

        var data_val_html = "<div class='webgl_rec_infobox_data_val'>" + val + filter_button_a + filter_button_r + "</div>";
        content_right += ("<div class='webgl_rec_infobox_data_row'>" + data_key_html + data_val_html +
                "</div>");
    }
    content_right += "\<div id='webgl_rec_infobox_filteroptions'>" +
            "   <span id='webgl_rec_infobox_filter_none'><a href='#'>None</a></span>" +
            "   <span id='webgl_rec_infobox_filter_all'><a href='#'>All</a></span>" +
            "</div>";

    var content_datacontainer2 = "<div style='float:right; width:49%' class='webgl_rec_infobox_datacontainer'>" + content_right + "</div>";

    var content = content_title + content_datacontainer1 + content_datacontainer2;



    this.buildForm_(content);


    jQuery('#webgl_rec_infobox_filter_all > a').click(function () {
        var filter_box = jQuery(this).parent().parent().parent();
        filter_box.find('.webgl_rec_infobox_data_filterapply').click();
    });
    jQuery('#webgl_rec_infobox_filter_none > a').click(function () {
        var filter_box = jQuery(this).parent().parent().parent();
        filter_box.find('.webgl_rec_infobox_data_filterremove').click();
    });


    /**
     * on filter-symbol click create a filter and apply it on the scene.
     * If this facet is not allowed as filter, ignore it.
     */
    jQuery('.webgl_rec_infobox_data_filterapply[rec_id=' + rec.getId() + ']').click(function (e) {
        var key = this.getAttribute("f_key");
        var val = this.getAttribute("f_val");

        if (!GLVIS.Filter.isFilter(key))
            return;

        var fh = GLVIS.Scene.getCurrentScene().getFilterHandler();
        var filter = new GLVIS.Filter(key, val);
        fh.addFilter(filter);
        fh.apply();

        jQuery(this).hide();
        jQuery(this).parent().children('.webgl_rec_infobox_data_filterremove[rec_id=' + rec.getId() + ']').show();
    });


    /**
     * on crossed filter-symbol click remove filter.
     */
    jQuery('.webgl_rec_infobox_data_filterremove[rec_id=' + rec.getId() + ']').click(function (e) {
        var key = this.getAttribute("f_key");

        if (!GLVIS.Filter.isFilter(key))
            return;

        var fh = GLVIS.Scene.getCurrentScene().getFilterHandler();
        var filter = new GLVIS.Filter(key, val);

        fh.removeFilter(key);
        fh.apply();

        jQuery(this).hide();
        jQuery(this).parent().children('.webgl_rec_infobox_data_filterapply[rec_id=' + rec.getId() + ']').show();

    });
};



/**
 * Create a fancybox form (or inofbox) with a specific content.
 * The Form will be shown directly after creating it
 * @param {string} content HTML-Code that will be shown in the box
 * @returns {undefined}
 */
GLVIS.Forms.prototype.buildForm_ = function (content) {
    var html = '<a id="webgl_form_link" href="#webgl_form_data" style="display:none"></a>' +
            '<div style="display:none">' +
            '   <div id="webgl_form_data">' + content + '</div>' +
            '</div>';

    if (!jQuery('#webgl_form_container').length)
        jQuery('body').append("<div id='webgl_form_container'></div>");

    jQuery('#webgl_form_container').html(html);
    jQuery("#webgl_form_link").fancybox({
        maxWidth: 700,
        maxHeight: 400,
        fitToView: false,
        width: '70%',
        height: '70%',
        autoSize: false,
        closeClick: false,
        openEffect: 'none',
        closeEffect: 'none'
    }).click();

    jQuery('#webgl_form_container').html("");
};