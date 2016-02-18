

var IQHN = IQHN || {};


/**
 * Highlighting recommendations of a collection if the given label exists in the rec
 * @param {type} collection
 * @returns {undefined}
 */
IQHN.HighlightRecsByLabel = function (collection) {

    IQHN.Debugger.debug("HighlightRecsByLabel", "Created highlighter", 2);
    /** @type{IQHN.Collection} **/
    this.collection_ = collection;
    this.current_highlight_ = null;

    this.previous_rec_colors_ = {};
};

/**
 * Highlight recs that have the label-text in Title
 * @param {IQHN.Text} label to be searched
 */
IQHN.HighlightRecsByLabel.prototype.highlight = function (label) {

    this.current_highlight_ = label.getText();

    if (IQHN.HighlightRecsByLabel.current_highlighter && IQHN.HighlightRecsByLabel.current_highlighter !== this)
        IQHN.HighlightRecsByLabel.current_highlighter.unHighlight();
    IQHN.HighlightRecsByLabel.current_highlighter = this;

    var recs = this.collection_.getRecommendations();
    for (var i = 0; i < recs.length; i++) {

        /** @type{IQHN.Recommendation} **/
        var curr_rec = recs[i];

        /**
         * Currently look if label in title, due to no labels existing in rec
         */
        var ee_data = curr_rec.getEexcessData();
        var title = ee_data.result.title.toLowerCase();
        var title_words = title.split(" ");

        var lc_label_text = label.getText().toLowerCase();

        IQHN.Debugger.debug("HighlightRecsByLabel", [
            "Searching for label " + lc_label_text + "' in title:", title_words], 7);
        if (title_words.indexOf(lc_label_text) !== -1) {

            IQHN.Debugger.debug("HighlightRecsByLabel",
                    "Highlighting rec " + curr_rec.getId() + " for label " + lc_label_text, 7);

            this.previous_rec_colors_[curr_rec.getId()] = curr_rec.getColor();
            curr_rec.setColor(IQHN.config.collection.recommendation.highlight_color);
        }
    }
};

/**
 * Reset Highlight. (Give the recs their config-color back)
 */
IQHN.HighlightRecsByLabel.prototype.unHighlight = function () {

    IQHN.HighlightRecsByLabel.current_highlighter = null;
    this.current_highlight_ = null;

    var recs = this.collection_.getRecommendations();
    for (var i = 0; i < recs.length; i++) {

        /** @type{IQHN.Recommendation} **/
        var curr_rec = recs[i];

        if (this.previous_rec_colors_[curr_rec.getId()] !== undefined)
            curr_rec.setColor(this.previous_rec_colors_[curr_rec.getId()]);
    }

    this.previous_rec_colors_ = {};
};

/**
 * Return the current highlighted label text
 * @returns {String | null}
 */
IQHN.HighlightRecsByLabel.prototype.getCurrentHighlightedLabel = function () {
    return this.current_highlight_;
};

/**
 * @type{IQHN.HighlightRecsByLabel}
 */
IQHN.HighlightRecsByLabel.current_highlighter = null;