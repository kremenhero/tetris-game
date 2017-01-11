game.servicesClasses.eventManager = function (options) {
    /* OOP call parent constructor */
    game.servicesClasses.eventManager.__super__.constructor.call(this, options);
};

/* extend from CoreCoreClass */
game.utils.oop.extend(game.servicesClasses.eventManager, game.coreClass);

/**
 * Registers event listener to window object
 * @options {{listenerIdentifier: string, listenerCallback: function, listenerContext: object}}
 */
game.servicesClasses.eventManager.prototype.registerEventListener = function (options) {
    options = options || {};

    window.addEventListener(options.listenerIdentifier, options.listenerCallback.bind(options.listenerContext), false);
};