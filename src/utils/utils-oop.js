game.utils.oop = {
    extend: function (child, parent) {
        parent = parent || {};

        Object.assign(child, parent);

        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
        child.__super__ = parent.prototype;
        return child;
    }
};
