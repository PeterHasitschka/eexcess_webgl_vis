var GLVIS = GLVIS || {};



GLVIS.Forms = function (scene) {
    this.scene_ = scene;
};


GLVIS.Forms.prototype.createFormRecInfo = function (rec) {

    var content = "<h2>" + rec.getId() + "</h2><p>Some recommendation content here!</p>";

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
        maxWidth: 400,
        maxHeight: 300,
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