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