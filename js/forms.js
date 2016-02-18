var IQHN = IQHN || {};



IQHN.Forms = function (scene) {
    this.scene_ = scene;
};

/**
 * Create an info-box showing details of a specific recommendation 
 * @param {IQHN.Recommendation} rec
 */
IQHN.Forms.prototype.createFormRecInfo = function (rec) {

    var e_data = rec.getEexcessData();

    /**
     * Build HTML Stuff here
     */
    var title = e_data.result.title;
    var content_title = jQuery('<h2/>', {
        text: 'Result-Details'
    }).append(jQuery('<h3/>', {
        text: title
    }));

    var open_link = jQuery('<a/>', {
        target: '__blank',
        href: e_data.result.uri,
        text: 'Open in new Tab'
    });

    var img_html = e_data.result.previewImage ? jQuery('<img>', {
        src: e_data.result.previewImage,
        title: title,
        alt: title
    }).prop("outerHTML") : null;

    var data = {
        "ID": rec.getId(),
        "Link": open_link.prop("outerHTML"),
        "Image": img_html
    };

    var content_datacontainer1 = jQuery('<div/>', {
        style: 'float:left; width:49%',
        class: 'webgl_rec_infobox_datacontainer'
    }).append(
            jQuery('<h4/>', {
                text: 'Infos'
            }));

    for (var key in data) {

        if (data[key] === null)
            continue;

        content_datacontainer1.append(
                jQuery('<div/>', {class: 'webgl_rec_infobox_data_row'})
                .append(jQuery('<div/>', {
                    class: 'webgl_rec_infobox_data_key',
                    text: key
                }))
                .append(jQuery('<div/>', {
                    class: 'webgl_rec_infobox_data_val',
                    html: data[key]
                }))
                );
    }


    var content_datacontainer2 = jQuery('<div/>', {
        style: 'float:right; width:49%',
        class: 'webgl_rec_infobox_datacontainer'
    }).append(
            jQuery('<h4/>', {
                text: 'Facets / Filters'
            }));


    var facets = e_data.result.facets;

    for (var key in facets) {

        var val = String(facets[key]);
        if (val.indexOf("http") === 0)
            val = jQuery('<a/>', {
                href: val,
                target: '__blank',
                text: 'Open in new Tab'
            }).prop("outerHTML");

        var filter_applied = IQHN.Scene.getCurrentScene().getFilterHandler().isFilterApplied(key, facets[key]);


        content_datacontainer2.append(
                jQuery('<div/>', {class: 'webgl_rec_infobox_data_row'})
                .append(jQuery('<div/>',
                        {
                            class: 'webgl_rec_infobox_data_key',
                            text: key
                        }
                ))
                .append(jQuery('<div/>', {
                    class: 'webgl_rec_infobox_data_val'
                })
                        .html(val)
                        .append(jQuery('<a/>', {
                            f_key: key,
                            f_val: facets[key],
                            rec_id: rec.getId(),
                            class: 'webgl_rec_infobox_data_filterbutton webgl_rec_infobox_data_filterapply',
                            style: 'display:' + (filter_applied ? "none" : "inline"),
                            title: 'Use as filter',
                            href: '#'
                        }))
                        .append(jQuery('<a/>', {
                            f_key: key,
                            f_val: facets[key],
                            rec_id: rec.getId(),
                            class: 'webgl_rec_infobox_data_filterbutton webgl_rec_infobox_data_filterremove',
                            style: 'display:' + (!filter_applied ? "none" : "inline"),
                            title: 'Remove filter',
                            href: '#'
                        })))
                );
    }
    content_datacontainer2.append(
            (jQuery('<div/>', {
                id: 'webgl_rec_infobox_filteroptions'
            })
                    .append(
                            jQuery('<span/>', {
                                id: 'webgl_rec_infobox_filter_none'
                            })
                            .append(
                                    jQuery('<a/>', {
                                        href: "#",
                                        text: 'None'
                                    })
                                    )
                            )
                    .append(
                            jQuery('<span/>', {
                                id: 'webgl_rec_infobox_filter_all'
                            })
                            .append(
                                    jQuery('<a/>', {
                                        href: "#",
                                        text: 'All'
                                    })
                                    )
                            )
                    )
            );



    var content = content_title.prop("outerHTML")
            + content_datacontainer1.prop("outerHTML")
            + content_datacontainer2.prop("outerHTML");

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

        if (!IQHN.Filter.isFilter(key))
            return;

        var fh = IQHN.Scene.getCurrentScene().getFilterHandler();
        var filter = new IQHN.Filter(key, val);
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

        if (!IQHN.Filter.isFilter(key))
            return;

        var fh = IQHN.Scene.getCurrentScene().getFilterHandler();
        var filter = new IQHN.Filter(key, val);

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
IQHN.Forms.prototype.buildForm_ = function (content) {

    var hidden_link = jQuery('<a/>', {
        id: 'webgl_form_link',
        href: '#webgl_form_data',
        style: 'display:none'
    });
    var content_wrapper = jQuery('<div/>', {
        style: 'display:none'
    }).append(jQuery('<div/>', {
        id: 'webgl_form_data'
    }).append(content));

    if (!jQuery('#webgl_form_container').length)
        jQuery('body').append(jQuery('<div/>', {id: 'webgl_form_container'}));

    jQuery('#webgl_form_container')
            .append(hidden_link)
            .append(content_wrapper);
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