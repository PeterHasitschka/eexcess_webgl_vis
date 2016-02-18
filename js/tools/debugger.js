var IQHN = IQHN || {};


IQHN.Debugger = {
    active_: IQHN.config.debug.active,
    level_: IQHN.config.debug.level,
    prefix_: IQHN.config.debug.prefix,
    css: "font-weight:bold;",
    classname_css: "color:green;"
};

/**
 * 
 * @param {string} class_name Class-Name
 * @param {mixed} value Value to print out
 * @param {integer} level 1-10: 1:Urgent, 5:e.g. Something was created, 10:Story telling
 * @returns {undefined}
 */
IQHN.Debugger.debug = function (class_name, value, level) {

    if (!this.active_ || level > this.level_)
        return;


    console.log(
            this.prefix_ + "L" + level + "::'%c" + class_name + "':%c",
            this.classname_css,
            this.css,
            value
            );

};