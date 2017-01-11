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