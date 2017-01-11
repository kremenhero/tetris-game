game.collections.CoreCollection = function (options) {
    /* OOP call parent constructor */
    game.collections.CoreCollection.__super__.constructor.call(this, options);
};

/* extend from CoreCoreClass */
game.utils.oop.extend(game.collections.CoreCollection, game.coreClass);