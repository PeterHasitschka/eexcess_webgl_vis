var GLVIS = GLVIS || {};


GLVIS.Debugger = {
    active_: GLVIS.config.debug.active,
    level_: GLVIS.config.debug.level,
    prefix_: GLVIS.config.debug.prefix
};

/**
 * 
 * @param {string} class_name Class-Name
 * @param {mixed} value Value to print out
 * @param {integer} level 1-10: 1:Urgent, 5:e.g. Something was created, 10:Story telling
 * @returns {undefined}
 */
GLVIS.Debugger.debug = function (class_name, value, level) {

    if (level > this.level_)
        return;
    console.log(this.prefix_+"L"+level+"::'"+class_name+"':", value);

};