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

    var title = e_data.result.title;
    var content_title = "<h2>Result-Details</h2><h3>" + title + "</h3>";

    var data = {
        "ID": rec.getId(),
        "Link": "<a target='__blank' href='" + e_data.result.uri + "'>Open in new Tab</a>",
        "Image": e_data.result.previewImage ? ("<img src='" + e_data.result.previewImage + "' title='" + title + "' alt='" + title + "'/>") : null
    };

    var content_left = "";
    for (var key in data) {

        if (data[key] === null)
            continue;

        var data_key_html = "<div class='webgl_rec_infobox_data_key'>" + key + "</div>";
        var data_val_html = "<div class='webgl_rec_infobox_data_val'>" + data[key] + "</div>";
        content_left += ("<div class='webgl_rec_infobox_data_row'>" + data_key_html + data_val_html +
                "</div>");
    }
    var content_datacontainer1 = "<div style='float:left; width:49%' class='webgl_rec_infobox_datacontainer'>" + content_left + "</div>";


    var content_right = "";

    var facets = e_data.result.facets;

    for (var key in facets) {
        var data_key_html = "<div class='webgl_rec_infobox_data_key'>" + key + "</div>";
        var data_val_html = "<div class='webgl_rec_infobox_data_val'>" + facets[key] + "</div>";
        content_right += ("<div class='webgl_rec_infobox_data_row'>" + data_key_html + data_val_html +
                "</div>");
    }
    var content_datacontainer2 = "<div style='float:right; width:49%' class='webgl_rec_infobox_datacontainer'>" + content_right + "</div>";

    var content = content_title + content_datacontainer1 + content_datacontainer2;
    this.buildForm_(content);
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
    console.log(html);
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