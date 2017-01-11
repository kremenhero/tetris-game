game.utils.number = {
    random: function (min, max) {
        return (min + (Math.random() * (max - min)));      
    },
    toScoreNumberFormat: function (score) {
        return ("00000" + Math.floor(score)).slice(-5);
    }
};