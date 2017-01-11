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