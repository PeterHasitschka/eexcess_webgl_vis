var GLVIS = GLVIS || {};



GLVIS.Forms = function (scene) {
    this.scene_ = scene;
};

/**
 * 
 * @param {GLVIS.Recommendation} rec
 */
GLVIS.Forms.prototype.createFormRecInfo = function (rec) {

    var e_data = rec.getEexcessData();

    var title = e_data.result.title;

    var content_title = "<h2>" + title + "</h2>";


    var data = {
        "ID": rec.getId(),
        "Link": "<a target='__blank' href='" + e_data.result.uri + "'>Open in new Tab</a>",
        "Image": "<img src='" + e_data.result.previewImage + "' title='" + title + "' alt='" + title + "'/>"
    };

    var data_list = "";
    for (var key in data) {
        var data_key_html = "<div class='webgl_rec_infobox_data_key'>" + key + "</div>";
        var data_val_html = "<div class='webgl_rec_infobox_data_val'>" + data[key] + "</div>";
        data_list += (data_key_html + data_val_html);
    }



    var content_datacontainer = "<div class='webgl_rec_infobox_datacontainer'>" + data_list + "</div>";

    var content = content_title + content_datacontainer;

    this.buildForm_(content);
};


GLVIS.Forms.prototype.buildForm_ = function (content) {
    var html = '<a id="webgl_form_link" href="#webgl_form_link_data" style="display:none"></a>' +
            '<div style="display:none">' +
            '   <div id="webgl_form_link_data">' + content + '</div>' +
            '</div>';

    if (!jQuery('#webgl_form_container').length)
        jQuery('body').append("<div id='webgl_form_container'></div>");

    jQuery('#webgl_form_container').html(html);

    jQuery("#webgl_form_link").fancybox({
        maxWidth: 500,
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