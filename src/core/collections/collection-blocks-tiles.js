game.collections.CollectionBlocksTiles = function (options) {
    /* OOP call parent constructor */
    game.collections.CollectionBlocksTiles.__super__.constructor.call(this, options);

    this.blocksTiles = {};
    this.blocksTilesChain = [];
    this.activeBlocksTilesChain = [];
    this.builtBlocksTilesSet = {};

    this.__initializeBlocksTiles();
};

/* extend from CoreCoreClass */
game.utils.oop.extend(game.collections.CollectionBlocksTiles, game.collections.CoreCollection);

/**
 * Fills blocks tiles objects on initialize
 */
game.collections.CollectionBlocksTiles.prototype.__initializeBlocksTiles = function () {
    var blocksTilesSettings = game.settingsGameConstants.BLOCKS_TILES,
        modeledBlocksTile,
        addBlockToChain = function (block) {
            var i;

            for (i = 4; i > 0; i--) {
                this.blocksTilesChain.push(block);
            }
        }.bind(this);

    blocksTilesSettings.forEach(function (blockTile) {
        modeledBlocksTile = new game.models.ModelBlockTile(blockTile);
        this.blocksTiles[modeledBlocksTile.name] = modeledBlocksTile;
        addBlockToChain(blockTile);
    }.bind(this));

    this.__resetActiveBlocksTilesChain();
};

/**
 * Resets blocks tiles chain to initial value
 * @private
 */
game.collections.CollectionBlocksTiles.prototype.__resetActiveBlocksTilesChain = function () {
    this.activeBlocksTilesChain = this.blocksTilesChain;
};

/**
 * Returns random blocks tile from active chain
 * @returns {object}
 */
game.collections.CollectionBlocksTiles.prototype.getRandomBlockTileFromChain = function () {
    if (this.activeBlocksTilesChain.length === 0) {
        this.__resetActiveBlocksTilesChain();
    }

    var randomIndex = Math.round(game.utils.number.random(0, this.activeBlocksTilesChain.length-1));

    return this.activeBlocksTilesChain[randomIndex];
};

/**
 * Returns blocks tile in case of this has been already on game board
 * @params {x: number, y: number}
 * @returns {object || null}
 */
game.collections.CollectionBlocksTiles.prototype.getBuiltBlocksTile = function (x, y) {
    var builtBlocksTile;

    builtBlocksTile = this.builtBlocksTilesSet && this.builtBlocksTilesSet[x] ?
                          this.builtBlocksTilesSet[x][y] :
                              null;

    return builtBlocksTile;
};

/**
 * Set blocks tile as built
 * @params {x: number, y: number, tile: object}
 * @returns {object || null}
 */
game.collections.CollectionBlocksTiles.prototype.setBuiltBlocksTile = function (x, y, tile) {
    this.builtBlocksTilesSet[x] = this.builtBlocksTilesSet[x] || [];
    this.builtBlocksTilesSet[x][y] = tile;

    this.servicesGameDataManager.setEntityStatus('gameBoard', true);
};

/**
 * Reset built blocks tiles
 */
game.collections.CollectionBlocksTiles.prototype.resetBlocksTiles = function () {
    this.builtBlocksTilesSet = [];

    this.servicesGameDataManager.setEntityStatus('gameBoard', true);
};