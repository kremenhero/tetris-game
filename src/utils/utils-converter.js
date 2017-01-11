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