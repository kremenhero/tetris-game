game.collections.CollectionBlocks = function (options) {
    /* OOP call parent constructor */
    game.collections.CollectionBlocks.__super__.constructor.call(this, options);

    this.currentBlock = {};
    this.nextBlock = {};
};

/* extend from CoreCoreClass */
game.utils.oop.extend(game.collections.CollectionBlocks, game.collections.CoreCollection);

/**
 * Returns random block
 * @returns {object}
 */
game.collections.CollectionBlocks.prototype.getRandomBlock = function () {
    var randomBlockTile = this.servicesGameDataManager.blocksTilesCollection.getRandomBlockTileFromChain(),
        modeledRandomBlock;

    modeledRandomBlock = new game.models.ModelBlock({
        tile: randomBlockTile,
        direction: game.settingsGameConstants.DIRECTION.UP,
        x: Math.round(game.utils.number.random(0, game.settingsGameConstants.BLOCK_SIZE.X - randomBlockTile.size)),
        y: 0,
        servicesGameDataManager: this.servicesGameDataManager
    });

    return modeledRandomBlock;
};

/**
 * Sets block as current
 * @param  block: {}
 */
game.collections.CollectionBlocks.prototype.setCurrentBlock = function (block) {
    this.currentBlock = block ? 
                            new game.models.ModelBlock(block) : 
                                this.getRandomBlock();
    
    this.servicesGameDataManager.setEntityStatus('gameBoard', true);
};

/**
 * Returns current block
 * @returns {object}
 */
game.collections.CollectionBlocks.prototype.getCurrentBlock = function () {
    return this.currentBlock;
};

/**
 * Sets block as next
 * @param  block: {}
 */
game.collections.CollectionBlocks.prototype.setNextBlock = function (block) {
    this.nextBlock = block ? 
                         new game.models.ModelBlock(block) : 
                             this.getRandomBlock();
    
    this.servicesGameDataManager.setEntityStatus('nextBlock', true);
};

/**
 * Returns next block
 * @returns {object}
 */
game.collections.CollectionBlocks.prototype.getNextBlock = function () {
    return this.nextBlock;
};