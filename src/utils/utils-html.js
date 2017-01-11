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