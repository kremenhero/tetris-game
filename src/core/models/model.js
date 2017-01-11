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