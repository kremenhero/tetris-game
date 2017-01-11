if (!window.requestAnimationFrame) { 
    window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
                                       window.mozRequestAnimationFrame ||
                                           window.oRequestAnimationFrame ||
                                               window.msRequestAnimationFrame ||
                                                   function(callback, element) {
                                                       window.setTimeout(callback, 1000 / 60);
                                                   }
}
if (!Object.keys) {
    Object.keys = (function() {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function(obj) {
            if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());
}
if ( !Object.assign ) {
    Object.defineProperty(Object, "assign", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function( target, firstSource ) {
            "use strict";
            if ( target === undefined || target === null ) {
                throw new TypeError( "Cannot convert first argument to object" );
            }

            var to = Object( target );
            for ( var i = 1; i < arguments.length; i++ ) {
                var nextSource = arguments[ i ];
                if ( nextSource === undefined || nextSource === null ) {
                    continue;
                }

                var keysArray = Object.keys( Object( nextSource ) );
                for ( var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++ ) {
                    var nextKey = keysArray[ nextIndex ];
                    var desc = Object.getOwnPropertyDescriptor( nextSource, nextKey );
                    if ( desc !== undefined && desc.enumerable ) {
                        to[ nextKey ] = nextSource[ nextKey ];
                    }
                }
            }
            return to;
        }
    });
}
/**
 * The Global Object which handles all game process
 */
var game = {
    models: {},
    collections: {},
    servicesClasses: {},
    graphicalEngine: {},
    utils: {},
    settingsGameConstants: {},
    Tetris: {}
};

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
game.utils.converter = {
    toNumber: function (input) {
        return +input;
    },
    toBoolean: function (input) {
        if (!input || input === 'false') {
            return false;
        }

        return true;
    },
    toString: function (input) {
        return input.toString();
    }
};
game.utils.html = {
    getElementById: function (id) {
        return document.getElementById(id);
    },
    hideElement: function (id) {
        this.getElementById(id).style.visibility = 'hidden';
    },
    showElement: function (id) {
        this.getElementById(id).style.visibility = null;
    },
    setHtml: function (id, html) {
        this.getElementById(id).innerHTML = html;
    }
};
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

game.utils.number = {
    random: function (min, max) {
        return (min + (Math.random() * (max - min)));      
    },
    toScoreNumberFormat: function (score) {
        return ("00000" + Math.floor(score)).slice(-5);
    }
};
game.utils.object = {
    effectiveLength: function (object) {
        var length = 0,
            key;
        
        for (key in object ) {
            if (object.hasOwnProperty(key) && object[key]) {
                length += 1;
            }
        }
        return length;
    }        
};
game.models.CoreModel = function (options) {
    /* OOP call parent constructor */
    game.models.CoreModel.__super__.constructor.call(this, options);
    
    //apply converter to keys
    this.convertToCorrectDataType();
};

/* extend from CoreCoreClass */
game.utils.oop.extend(game.models.CoreModel, game.coreClass);

/**
 * Coverts model fields to correct data type
 */
game.models.CoreModel.prototype.convertToCorrectDataType = function () {
    var key;

    for (key in this.correctDataType) {
        if (this.correctDataType.hasOwnProperty(key) && this[key]) {
            this[key] = this.correctDataType[key](this[key]);
        }
    }
};
game.models.ModelBlock = function (options) {
    /* OOP call parent constructor */
    game.models.ModelBlock.__super__.constructor.call(this, options);
};

/* extend from CoreModel */
game.utils.oop.extend(game.models.ModelBlock, game.models.CoreModel);

game.models.ModelBlock.prototype.correctDataType = {
    direction: game.utils.converter.toNumber,
    x: game.utils.converter.toNumber,
    y: game.utils.converter.toNumber
};

/**
 * Iterates block through its tiles
 * @params {callback: function}
 */
game.models.ModelBlock.prototype.iterate = function (callback) {
    var bit,
        row = 0,
        col = 0,
        blockPattern = this.tile.patterns[this.direction];

    for (bit = 0x8000; bit > 0; bit = bit >> 1) {
        if (blockPattern & bit) {
            callback(this.x + col, this.y + row);
        }

        if (++col === 4) {
            col = 0;
            ++row;
        }
    }
};

/**
 * Drops block
 */
game.models.ModelBlock.prototype.drop = function () {
    var callback = function(x, y) {
        this.servicesGameDataManager.blocksTilesCollection.setBuiltBlocksTile(x, y, this.tile);
    }.bind(this);

    this.iterate(callback);
};

/**
 * Checks if block can continue moving
 */
game.models.ModelBlock.prototype.isMovable = function () {
    var result = false,
        blockSizeSettings = game.settingsGameConstants.BLOCK_SIZE,
        callback = function(x, y) {
            if ((x < 0) ||
                    (x >= blockSizeSettings.X) ||
                        (y < 0) ||
                            (y >= blockSizeSettings.Y) ||
                                this.servicesGameDataManager.blocksTilesCollection.getBuiltBlocksTile(x, y)) {
                    result = true;
            }
        }.bind(this);

    this.iterate(callback);

    return !result;
};
game.models.ModelBlockTile = function (options) {
    /* OOP call parent constructor */
    game.models.ModelBlockTile.__super__.constructor.call(this, options);
};

/* extend from CoreModel */
game.utils.oop.extend(game.models.ModelBlockTile, game.models.CoreModel);

game.models.ModelBlockTile.prototype.correctDataType = {
    size: game.utils.converter.toNumber,
    color: game.utils.converter.toString,
    type: game.utils.converter.toString
};
game.collections.CoreCollection = function (options) {
    /* OOP call parent constructor */
    game.collections.CoreCollection.__super__.constructor.call(this, options);
};

/* extend from CoreCoreClass */
game.utils.oop.extend(game.collections.CoreCollection, game.coreClass);
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
game.servicesClasses.gameDataManager = function (options) {
    game.servicesClasses.gameDataManager.__super__.constructor.call(this, options);
    /**
     * Handle CollectionEvents instance
     */
    this.blocksCollection = new game.collections.CollectionBlocks({servicesGameDataManager: this});
    this.blocksTilesCollection = new game.collections.CollectionBlocksTiles({servicesGameDataManager: this});


    this.invalidationStatus = {
        gameBoard: false,
        nextBlock: false,
        score: false,
        rows: false
    };

    this.playing = false;
    this.userActions = [];
    this.score = 0;
    this.visualScore = 0;
    this.rows = 0;
    this.step = 0;
    this.deltaTime = 0;
};

/* extend from CoreCoreClass */
game.utils.oop.extend(game.servicesClasses.gameDataManager, game.coreClass);

/**
 * Adds users action to queue or fires related to action event
 * @params {event: object}
 */
game.servicesClasses.gameDataManager.prototype.addUserActionToQueue = function (event) {
    var handled = false;

    if (this.playing) {
        switch(event.keyCode) {
            case game.settingsGameConstants.KEYS_CODE.LEFT:
                this.userActions.push(game.settingsGameConstants.DIRECTION.LEFT);
                break;
            case game.settingsGameConstants.KEYS_CODE.RIGHT:
                this.userActions.push(game.settingsGameConstants.DIRECTION.RIGHT);
                break;
            case game.settingsGameConstants.KEYS_CODE.UP:
                this.userActions.push(game.settingsGameConstants.DIRECTION.UP);
                break;
            case game.settingsGameConstants.KEYS_CODE.DOWN:
                this.userActions.push(game.settingsGameConstants.DIRECTION.DOWN);
                break;
            case game.settingsGameConstants.KEYS_CODE.ESC:
                this.gameOverAction();
                break;
        }
        handled = true;
    } else if (event.keyCode === game.settingsGameConstants.KEYS_CODE.SPACE) {
        this.playAction();
        handled = true;
    }

    if (handled) {
        event.preventDefault();
    }
};

/**
 * Handles user action and fires event
 * @params {action: number}
 */
game.servicesClasses.gameDataManager.prototype.handleUserAction = function (action) {
    switch(action) {
        case game.settingsGameConstants.DIRECTION.LEFT:
            this.moveAction(game.settingsGameConstants.DIRECTION.LEFT);
            break;
        case game.settingsGameConstants.DIRECTION.RIGHT:
            this.moveAction(game.settingsGameConstants.DIRECTION.RIGHT);
            break;
        case game.settingsGameConstants.DIRECTION.UP:
            this.rotateAction();
            break;
        case game.settingsGameConstants.DIRECTION.DOWN:
            this.dropAction();
            break;
    }
};

/**
 * Resets all game related params
 */
game.servicesClasses.gameDataManager.prototype.resetGame = function () {
    var nextBlock = this.blocksCollection.getNextBlock();

    this.deltaTime = 0;
    this.clearUserActions();
    this.blocksTilesCollection.resetBlocksTiles();
    this.clearRows();
    this.clearScore();
    this.blocksCollection.setCurrentBlock(nextBlock);
    this.blocksCollection.setNextBlock();
};

/**
 * Updates game, draws new score and new position of block
 * @params {idt: number}
 */
game.servicesClasses.gameDataManager.prototype.updateGame = function (idt) {
    if (this.playing) {
        if (this.visualScore < this.score) {
            this.setVisualScore(this.visualScore + 1);
        }

        this.handleUserAction(this.userActions.shift());
        this.deltaTime = this.deltaTime + idt;
        if (this.deltaTime > this.step) {
            this.deltaTime = this.deltaTime - this.step;
            this.dropAction();
        }
    }
};

/**
 * Sets game in active status
 */
game.servicesClasses.gameDataManager.prototype.playAction = function () {
    game.utils.html.setHtml(game.settingsGameConstants.BLOCKS_HTML_ID.GAME_STATUS, 'Press escape to surrender.');
    this.resetGame();
    this.playing = true;
};

/**
 * Sets game in passive status
 */
game.servicesClasses.gameDataManager.prototype.gameOverAction = function () {
    game.utils.html.setHtml(game.settingsGameConstants.BLOCKS_HTML_ID.GAME_STATUS, 'Press Space to Play.');
    this.setVisualScore();
    this.playing = false;
};

/**
 * Callback on move action and returns if block can move further
 * @params {direction: number}
 * @returns {boolean}
 */
game.servicesClasses.gameDataManager.prototype.moveAction = function (direction) {
    var currentBlock = this.blocksCollection.getCurrentBlock(),
        possibleBlock = new game.models.ModelBlock(),
        result;

    Object.assign(possibleBlock, currentBlock);

    switch(direction) {
        case game.settingsGameConstants.DIRECTION.RIGHT:
            possibleBlock.x += 1;
            break;
        case game.settingsGameConstants.DIRECTION.LEFT:
            possibleBlock.x -= 1;
            break;
        case game.settingsGameConstants.DIRECTION.DOWN:
            possibleBlock.y += 1;
            break;
    }

    result = possibleBlock.isMovable();
    if (result) {
        this.blocksCollection.setCurrentBlock(possibleBlock);
    }

    return result;
};

/**
 * Callback on rotate action
 */
game.servicesClasses.gameDataManager.prototype.rotateAction = function () {
    var currentBlock = this.blocksCollection.getCurrentBlock(),
        possibleBlock = new game.models.ModelBlock();

    Object.assign(possibleBlock, currentBlock);

    possibleBlock.direction = (possibleBlock.direction === game.settingsGameConstants.DIRECTION.MAX ?
                                  game.settingsGameConstants.DIRECTION.MIN :
                                      possibleBlock.direction + 1);

    if (possibleBlock.isMovable()) {
        this.blocksCollection.setCurrentBlock(possibleBlock);
        this.setEntityStatus('gameBoard', true);
    }
};

/**
 * Callback on drop action
 */
game.servicesClasses.gameDataManager.prototype.dropAction = function () {
    var nextBlock,
        currentBlock;

    if (!this.moveAction(game.settingsGameConstants.DIRECTION.DOWN)) {
        nextBlock = this.blocksCollection.getNextBlock();
        currentBlock = this.blocksCollection.getCurrentBlock();

        this.addScore(10);
        currentBlock.drop();
        this.removeLines();
        this.blocksCollection.setCurrentBlock(nextBlock);
        this.blocksCollection.setNextBlock(this.blocksCollection.getRandomBlock());
        this.clearUserActions();

        if (!nextBlock.isMovable()) {
            this.gameOverAction();
        }
    }
};

/**
 * Resets all user actions
 */
game.servicesClasses.gameDataManager.prototype.clearUserActions = function () {
    this.userActions = [];
};

/**
 * Removes built lines and fires new scores and built rows callbacks
 */
game.servicesClasses.gameDataManager.prototype.removeLines = function () {
    var x,
        y,
        complete,
        n = 0,
        blockSizeSettings = game.settingsGameConstants.BLOCK_SIZE;

    for (y = blockSizeSettings.Y; y > 0; --y) {
        complete = true;

        for (x = 0; x < blockSizeSettings.X; ++x) {
            if (!this.blocksTilesCollection.getBuiltBlocksTile(x, y))
                complete = false;
        }

        if (complete) {
            this.removeLine(y);
            y = y + 1;
            n++;
        }
    }

    if (n > 0) {
        this.addRows(n);
        this.addScore(100 * Math.pow(2, n-1));
    }
};

/**
 * Removes line from built objects
 * @params {n: number}
 */
game.servicesClasses.gameDataManager.prototype.removeLine = function (n) {
    var x,
        y,
        tile;

    for (y = n; y >= 0; --y) {
        for(x = 0 ; x < game.settingsGameConstants.BLOCK_SIZE.X ; ++x) {
            tile = (y === 0) ?
                       null :
                           this.blocksTilesCollection.getBuiltBlocksTile(x, y-1);

            this.blocksTilesCollection.setBuiltBlocksTile(x, y, tile);
        }
    }
};

/**
 * Sets entity status
 * @params {entity: string, status: boolean}
 */
game.servicesClasses.gameDataManager.prototype.setEntityStatus = function (entity, status) {
    this.invalidationStatus[entity] = status;
};

/**
 * Returns entity status
 * @params {entity: string}
 */
game.servicesClasses.gameDataManager.prototype.getEntityStatus = function (entity) {
    return this.invalidationStatus[entity];
};

/**
 * Sets built rows
 * @params {n: number}
 */
game.servicesClasses.gameDataManager.prototype.setRows = function (n) {
    var speedSettings = game.settingsGameConstants.SPEED;

    this.rows = n;
    this.step = Math.max(speedSettings.MIN, speedSettings.START - (speedSettings.DECREMENT * this.rows));

    this.setEntityStatus('rows', true);
};

/**
 * Adds built rows to existed
 * @params {n: number}
 */
game.servicesClasses.gameDataManager.prototype.addRows = function (n) {
    this.setRows(this.rows + n);
};

/**
 * Returns built rows
 * @returns {number}
 */
game.servicesClasses.gameDataManager.prototype.getRows = function () {
    return this.rows;
};

/**
 * Sets visual score
 */
game.servicesClasses.gameDataManager.prototype.setVisualScore = function (n) {
    this.visualScore = n || this.score;
    this.setEntityStatus('score', true);
};

/**
 * Returns visual score
 */
game.servicesClasses.gameDataManager.prototype.getVisualScore = function () {
    return this.visualScore;
};

/**
 * Sets score
 * @params {n: number}
 */
game.servicesClasses.gameDataManager.prototype.setScore = function (n) {
    this.score = n;
    this.setVisualScore(n);
};

/**
 * Adds score to existed
 * @params {n: number}
 */
game.servicesClasses.gameDataManager.prototype.addScore = function (n) {
    this.score = this.score + n;
};

/**
 * Reset score
 */
game.servicesClasses.gameDataManager.prototype.clearScore = function () {
    this.setScore(0);
};

/**
 * Resets built rows
 * @params {n: number}
 */
game.servicesClasses.gameDataManager.prototype.clearRows = function () {
    this.setRows(0);
};

/**
 * Returns game status
 * @returns {boolean}
 */
game.servicesClasses.gameDataManager.prototype.isPlaying = function () {
    return this.playing;
};
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
game.settingsGameConstants = {
    KEYS_CODE: {
        ESC: 27, 
        SPACE: 32, 
        LEFT: 37, 
        UP: 38, 
        RIGHT: 39, 
        DOWN: 40
    },
    DIRECTION: {
        UP: 0, 
        RIGHT: 1, 
        DOWN: 2, 
        LEFT: 3, 
        MIN: 0, 
        MAX: 3
    },
    SPEED: {
        START: 0.3,
        DECREMENT: 0.005, 
        MIN: 0.1
    },
    BLOCK_SIZE: {
        X: 20,
        Y: 20
    },
    UPCOMING_BOARD_SIZE: 8.5,
    BLOCKS_HTML_ID: {
        GAME_BOARD: 'game-board',
        GAME_UPCOMING_BOARD: 'game-upcoming-board',
        GAME_STATUS: 'game-status',
        GAME_EARNED_SCORES: 'game-earned-scores',
        GAME_BUILT_ROWS: 'game-built-rows'
    },
    BLOCKS_TILES: [
        {name: 'i', size: 4, patterns: [0x0F00, 0x2222, 0x00F0, 0x4444], image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAB3RJTUUH3gYaDDcXTspJMwAAABd0RVh0U29mdHdhcmUAR0xEUE5HIHZlciAzLjRxhaThAAAACHRwTkdHTEQzAAAAAEqAKR8AAAAEZ0FNQQAAsY8L/GEFAAAABmJLR0QA/wD/AP+gvaeTAAAABnRSTlMAzADMAMxIJOP0AAAApElEQVR4nGM4c+ZM6ZHjQBTT1Q0hkRloCKiYASjXfvkqVmk0BFHGQIxSZMQkaWXDAAbanl54EAMMMDEgAX4ubiCCMBhwAKbnx44g8z9++wonsWuAO4lYgBwIeBDC08Qb/fr6NQZMT+PRIKqpha4Bq1/fffyEzMXpJIg6ZNVYnIQMhPj5ICSEgQBw77snJuJBcGUM8FRFbOIDplhcKiAGI9sAVAwAcI7P7bN4vTYAAAAASUVORK5CYII='},
        {name: 'j', size: 3, patterns: [0x44C0, 0x8E00, 0x6440, 0x0E20], image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAB3RJTUUH3gYaDDcCIxet2AAAABd0RVh0U29mdHdhcmUAR0xEUE5HIHZlciAzLjRxhaThAAAACHRwTkdHTEQzAAAAAEqAKR8AAAAEZ0FNQQAAsY8L/GEFAAAABmJLR0QA/wD/AP+gvaeTAAAABnRSTlMAzADMAMxIJOP0AAAApElEQVR4nGM4c+ZM57wPQFTStA1CIjPQEFAxA1BuzvrfWKXREEQZAzFKkRGTqIwVAxho6LriQQwwwMSABPj4WIAIwmDAAZhePzmGzP/06Q+cxK4B7iRiAXIg4EEITxNv9NsXVxgwPY1Hg7CEDroGrH59+/4rMhenkyDqkFVjcRKKAwS5ISSEgQBw7ydmdeFBcGUM8FRFbOIDplhcKiAGI9sAVAwATNblg/SgMfsAAAAASUVORK5CYII='},
        {name: 'l', size: 3, patterns: [0x4460, 0x0E80, 0xC440, 0x2E00], image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAB3RJTUUH3gYaDDYqD7k0YwAAABd0RVh0U29mdHdhcmUAR0xEUE5HIHZlciAzLjRxhaThAAAACHRwTkdHTEQzAAAAAEqAKR8AAAAEZ0FNQQAAsY8L/GEFAAAABmJLR0QA/wD/AP+gvaeTAAAABnRSTlMAzADMAMxIJOP0AAAAnUlEQVR4nGM4c+bM/ykpQLS3MgpCIjPQEFAxA0j18mqs0mgIooyBGKXIiMlJmosBDJz0FPEgBhhgYkAG/MIgBGHgAEz7nn5DEfj4FkFi1QB3ErEAORDwIISniTf6wsuvDFg8jRsYiHNjaMDq17cvkXm4nQRRh6Qam5OQgbA4lIQw4ADu/d4kfzwIrowBnqqITXzAFItLBcRgZBuAigG2W9ML6+xFIgAAAABJRU5ErkJggg=='},
        {name: 'o', size: 2, patterns: [0xCC00, 0xCC00, 0xCC00, 0xCC00], image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAB3RJTUUH3gYaDDYeLg3A1gAAABd0RVh0U29mdHdhcmUAR0xEUE5HIHZlciAzLjRxhaThAAAACHRwTkdHTEQzAAAAAEqAKR8AAAAEZ0FNQQAAsY8L/GEFAAAABmJLR0QA/wD/AP+gvaeTAAAABnRSTlMAzADMAMxIJOP0AAAAoUlEQVR4nGM4c+bMzzuTgOjgujoIicxAQ0DFDEC5/08XYJVGQxBlDMQoRUZMFnoiDGBgZ66EBzHAABMDMmDnASEIAwdgOnHpDYrAzy8IEqsGuJOIBciBgAchPE280Vduv2XA4mncQEdVGEMDNr/++v4JmYvTSRB1yKqxOQkJsHHyQUgIAwHg3p/amY0HwZUxwFMVsYkPmGJxqYAYjGwDUDEA1mH9PgXalgQAAAAASUVORK5CYII='},
        {name: 's', size: 3, patterns: [0x06C0, 0x8C40, 0x6C00, 0x4620], image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAB3RJTUUH3gYaDDY2G7hoLAAAABd0RVh0U29mdHdhcmUAR0xEUE5HIHZlciAzLjRxhaThAAAACHRwTkdHTEQzAAAAAEqAKR8AAAAEZ0FNQQAAsY8L/GEFAAAABmJLR0QA/wD/AP+gvaeTAAAABnRSTlMAzADMAMxIJOP0AAAApElEQVR4nGM4c+ZM56UdQFS8aCKERGagIaBiBqDcnAfHsUqjIYgyBmKUIiMmMQN1BjDQtDPDgxhggIkBCfBx8QARhMGAAzC9unATmf/p2xc4iV0D3EnEAuRAwIMQnibe6De3HzJgehqPBhFVeXQNWP369tNHZC5OJ0HUIavG4iRkIMzHDyEhDASAez++tggPgitjgKcqYhMfMMXiUgExGNkGoGIAJYXjRTBqCYQAAAAASUVORK5CYII='},
        {name: 't', size: 3, patterns: [0x0E40, 0x4C40, 0x4E00, 0x4640], image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAB3RJTUUH3gYaDDcKLcwl6gAAABd0RVh0U29mdHdhcmUAR0xEUE5HIHZlciAzLjRxhaThAAAACHRwTkdHTEQzAAAAAEqAKR8AAAAEZ0FNQQAAsY8L/GEFAAAABmJLR0QA/wD/AP+gvaeTAAAABnRSTlMAzADMAMxIJOP0AAAApElEQVR4nGM4c+bM3pJPQDQtYweERGagIaBiBqDc6Y4/WKXREEQZAzFKkRGTOo8VAxiYKrjgQQwwwMSABLgFmIEIwmDAAZhufjmGzP/64S+cxK4B7iRiAXIg4EEITxNv9INPVxgwPY1HgwKfDroGrH799OYbMhenkyDqkFVjcRIy4BPhgpAQBgLAvV8W1YMHwZUxwFMVsYkPmGJxqYAYjGwDUDEAv7bpg5h8XA8AAAAASUVORK5CYII='},
        {name: 'z', size: 3, patterns: [0x0C60, 0x4C80, 0xC600, 0x2640], image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAB3RJTUUH3gYaDDYUztgpyAAAABd0RVh0U29mdHdhcmUAR0xEUE5HIHZlciAzLjRxhaThAAAACHRwTkdHTEQzAAAAAEqAKR8AAAAEZ0FNQQAAsY8L/GEFAAAABmJLR0QA/wD/AP+gvaeTAAAABnRSTlMAzADMAMxIJOP0AAAApElEQVR4nGM4c+bMq/wWIFqXkAshkRloCKiYASj3o20WVmk0BFHGQIxSZMRkwy/OAAZearp4EAMMMDEgAXYRQSCCMBhwAKYjH18i83++eQ8nsWuAO4lYgBwIeBDC08QbfeXjGwZMT+PRoMMvgq4Bq18/vXyFzMXpJIg6ZNVYnIQM+MTFICSEgQBw7zcFRuJBcGUM8FRFbOIDplhcKiAGI9sAVAwAzHHRZfXkd5UAAAAASUVORK5CYII='}
    ]
};
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
window.addEventListener('DOMContentLoaded', function () {
    'use strict';
    new game.Tetris();
}, false);