game.coreClass = function (options) {
    this.setOptions(options);
};

/**
 * Sets options to context
 * @params {options: object}
 */
game.coreClass.prototype.setOptions = function (options) {
    'use strict';
    var opt = options || {};

    Object.assign(this, opt);
};