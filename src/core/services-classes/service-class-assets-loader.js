game.servicesClasses.assetsLoader = function (options) {
    /* OOP call parent constructor */
    game.servicesClasses.assetsLoader.__super__.constructor.call(this, options);

    this.imagesAssets = {};
    this.downloadQueue = {};
    this.loadedAssetsSuccessCount = 0;
    this.loadedAssetsErrorCount = 0;

    if (this.__fillDownloadQueue()) {
        this.__preloadAssets();
    } 
};

/* extend from CoreCoreClass */
game.utils.oop.extend(game.servicesClasses.assetsLoader, game.coreClass);

/**
 * Fills assets download queue
 * @private
 */
game.servicesClasses.assetsLoader.prototype.__fillDownloadQueue = function () {
    var blocksTilesSettings = game.settingsGameConstants.BLOCKS_TILES;

    blocksTilesSettings.forEach(function (blocksTile) {
        this.downloadQueue[blocksTile.name] = blocksTile.image;
    }.bind(this));
    
    return true;
};

/**
 * Loads all necessary assets and fires callback on finish
 * @private
 */
game.servicesClasses.assetsLoader.prototype.__preloadAssets = function () {
    var tileImage;

    Object.keys(this.downloadQueue).forEach(function (file) {
        tileImage = new Image();
        
        tileImage.addEventListener("load", function() {
            this.loadedAssetsSuccessCount += 1;

            if (this.__isQueueLoadingFinished()) {
                this.onAssetsLoadedCallback();
            }
        }.bind(this), false);
        
        tileImage.addEventListener("error", function() {
            this.loadedAssetsErrorCount += 1;

            if (this.__isQueueLoadingFinished()) {
                this.onAssetsLoadedCallback();
            }
        }.bind(this), false);
        
        tileImage.src = this.downloadQueue[file];
        this.imagesAssets[file] = tileImage;
    }.bind(this))
};

/**
 * Checks if all assets have been loaded
 * @private
 */
game.servicesClasses.assetsLoader.prototype.__isQueueLoadingFinished = function () {
    return game.utils.object.effectiveLength(this.downloadQueue) === (this.loadedAssetsSuccessCount + this.loadedAssetsErrorCount);
};

/**
 * Returns loaded assets
 * @returns {object}
 */
game.servicesClasses.assetsLoader.prototype.getAssets = function () {
    return this.imagesAssets;    
};