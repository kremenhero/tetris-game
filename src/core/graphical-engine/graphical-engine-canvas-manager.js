game.graphicalEngine.CanvasManager = function (options) {
    /* OOP call parent constructor */
    game.graphicalEngine.CanvasManager.__super__.constructor.call(this, options);
    
    this.__initializeCanvas();
    this.blockX = 0;
    this.blockY = 0;
    this.imagesAssets = this.servicesAssetsLoader.getAssets();
};

/* extend from CoreCoreClass */
game.utils.oop.extend(game.graphicalEngine.CanvasManager, game.coreClass);

/**
 * Set canvases on initialize
 * @private
 */
game.graphicalEngine.CanvasManager.prototype.__initializeCanvas = function () {
    var blocksHtmlIdSettings = game.settingsGameConstants.BLOCKS_HTML_ID;
    
    this.mainCanvas  = game.utils.html.getElementById(blocksHtmlIdSettings.GAME_BOARD);
    this.mainCanvasCtx = this.mainCanvas.getContext('2d');
    
    this.upcomingCanvas = game.utils.html.getElementById(blocksHtmlIdSettings.GAME_UPCOMING_BOARD);
    this.upcomingCanvasCtx = this.upcomingCanvas.getContext('2d');    
};

/**
 * Draws next block in upcoming board
 * @private
 */
game.graphicalEngine.CanvasManager.prototype.__drawNextBlock = function () {
    var upcomingBoardSize = game.settingsGameConstants.UPCOMING_BOARD_SIZE,
        nextBlock = this.servicesGameDataManager.blocksCollection.getNextBlock(),
        padding = (upcomingBoardSize - nextBlock.tile.size) / 2,
        tempBlock;
    
    if (this.servicesGameDataManager.getEntityStatus('nextBlock')) {
        tempBlock = new game.models.ModelBlock({
            tile: nextBlock.tile,
            x: padding,
            y: padding,
            direction: nextBlock.direction
        });
        
        this.upcomingCanvasCtx.save();
        this.upcomingCanvasCtx.translate(0.5, 0.5);
        this.upcomingCanvasCtx.clearRect(0, 0, upcomingBoardSize * this.blockX, upcomingBoardSize * this.blockY);
        this.__drawBlock(this.upcomingCanvasCtx, tempBlock);
        this.upcomingCanvasCtx.restore();
        
        this.servicesGameDataManager.setEntityStatus('nextBlock', false);
    }
};

/**
 * Sets score value into html block
 * @private
 */
game.graphicalEngine.CanvasManager.prototype.__drawScore = function () {
    var visualScore = this.servicesGameDataManager.getVisualScore();

    if (this.servicesGameDataManager.getEntityStatus('score')) {
        game.utils.html.setHtml(game.settingsGameConstants.BLOCKS_HTML_ID.GAME_EARNED_SCORES, game.utils.number.toScoreNumberFormat(visualScore));
        this.servicesGameDataManager.setEntityStatus('score', false);
    }
};

/**
 * Sets rows value into html block
 * @private
 */
game.graphicalEngine.CanvasManager.prototype.__drawRows = function () {
    var rows = this.servicesGameDataManager.getRows();

    if (this.servicesGameDataManager.getEntityStatus('rows')) {
        game.utils.html.setHtml(game.settingsGameConstants.BLOCKS_HTML_ID.GAME_BUILT_ROWS, rows);
        this.servicesGameDataManager.setEntityStatus('rows', false);
    }
};

/**
 * Draws block
 * @private
 * @params {ctx: object, block: object}
 */
game.graphicalEngine.CanvasManager.prototype.__drawBlock = function (ctx, block) {
    var callback = function (x, y) {
            this.__drawTile(ctx, x, y, block.tile.name);
        }.bind(this);

    block.iterate(callback);
};

/**
 * Draws blocks tile
 * @private
 * @params {ctx: object, x: number, y: number, name: string}
 */
game.graphicalEngine.CanvasManager.prototype.__drawTile = function (ctx, x, y, name) {
    ctx.drawImage(this.imagesAssets[name], x * this.blockX, y * this.blockY, this.blockX, this.blockY);
};

/**
 * Draws game board
 * @private
 */
game.graphicalEngine.CanvasManager.prototype.__drawGameBoard = function () {
    var currentBlock = this.servicesGameDataManager.blocksCollection.getCurrentBlock(),
        blockSizeSettings = game.settingsGameConstants.BLOCK_SIZE,
        x,
        y,
        blockTile;

    if (this.servicesGameDataManager.getEntityStatus('gameBoard')) {
        this.mainCanvasCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);

        if (this.servicesGameDataManager.isPlaying()) {
            this.__drawBlock(this.mainCanvasCtx, currentBlock);
        }
        
        for (y = 0; y < blockSizeSettings.Y; y++) {
            for (x = 0; x < blockSizeSettings.X; x++) {
                blockTile = this.servicesGameDataManager.blocksTilesCollection.getBuiltBlocksTile(x, y);
                
                if (blockTile) {
                    this.__drawTile(this.mainCanvasCtx, x, y, blockTile.name);
                }
            }
        }
        this.mainCanvasCtx.strokeRect(0, 0, blockSizeSettings.X * this.blockX - 1, blockSizeSettings.Y * this.blockY - 1);
        
        this.servicesGameDataManager.setEntityStatus('gameBoard', false);
    }
};

/**
 * Draws all game related objects
 */
game.graphicalEngine.CanvasManager.prototype.draw = function () {
    this.mainCanvasCtx.save();
    this.mainCanvasCtx.lineWidth = 1;
    this.mainCanvasCtx.translate(0.5, 0.5);
    this.__drawGameBoard();
    this.__drawNextBlock();
    this.__drawScore();
    this.__drawRows();
    this.mainCanvasCtx.restore();
};

/**
 * Sets all game related sizes
 */
game.graphicalEngine.CanvasManager.prototype.setCanvasSizes = function () {
    var blockSizeSettings = game.settingsGameConstants.BLOCK_SIZE;

    this.mainCanvas.width = this.mainCanvas.clientWidth;
    this.mainCanvas.height  = this.mainCanvas.clientHeight;
    this.upcomingCanvas.width  = this.upcomingCanvas.clientWidth;
    this.upcomingCanvas.height = this.upcomingCanvas.clientHeight;
    this.blockX = this.mainCanvas.width  / blockSizeSettings.X;
    this.blockY = this.mainCanvas.height / blockSizeSettings.Y;

    this.servicesGameDataManager.setEntityStatus('gameBoard', true);
    this.servicesGameDataManager.setEntityStatus('nextBlock', true);
};

/**
 * Returns main canvas
 * @returns {object}
 */
game.graphicalEngine.CanvasManager.prototype.getMainCanvas = function () {
    return this.mainCanvas;
};