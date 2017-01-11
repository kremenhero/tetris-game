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