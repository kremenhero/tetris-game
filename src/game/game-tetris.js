game.Tetris = function (options) {
    /* OOP call parent constructor */
    game.Tetris.__super__.constructor.call(this, options);

    this.__beforeStartGame();
};

/* extend from CoreCoreClass */
game.utils.oop.extend(game.Tetris, game.coreClass);

/**
 * Starts assets loading and fires this.__startGame on finish
 * @private
 */
game.Tetris.prototype.__beforeStartGame = function () {
    this.servicesAssetsLoader = new game.servicesClasses.assetsLoader({
        onAssetsLoadedCallback: this.__startGame.bind(this)
    });
};

/**
 * Initializes all game classes and calls necessary functions for game start
 * @private
 */
game.Tetris.prototype.__startGame = function () {
    this.servicesGameDataManager = new game.servicesClasses.gameDataManager();
    this.servicesEventManager = new game.servicesClasses.eventManager()
    ;
    this.graphicalEngine = new game.graphicalEngine.CanvasManager({
        servicesGameDataManager: this.servicesGameDataManager,
        servicesAssetsLoader: this.servicesAssetsLoader
    });

    this.__registerEvents();
    this.graphicalEngine.setCanvasSizes();
    this.servicesGameDataManager.resetGame();
    this.__localUpdate();
};

/**
 * Game local update method
 * @private
 */
game.Tetris.prototype.__localUpdate = function () {
    var mainCanvas = this.graphicalEngine.getMainCanvas(),
        now = new Date().getTime(),
        last = now,
        animate = function () {
            now = new Date().getTime();
            this.servicesGameDataManager.updateGame(Math.min(1, (now - last) / 1000));
            this.graphicalEngine.draw();
            last = now;
            requestAnimationFrame(animate, mainCanvas);
        }.bind(this);

    animate();
};

/**
 * Registers events
 * @private
 */
game.Tetris.prototype.__registerEvents = function () {
    this.servicesEventManager.registerEventListener({
        listenerIdentifier: 'keydown',
        listenerCallback: this.servicesGameDataManager.addUserActionToQueue,
        listenerContext: this.servicesGameDataManager
    });
};