(function(global) {
    'use strict';
    var Stats = Stats || function(editor, options) {
        var self = this;

        editor.on("init", updateStats);

        function updateStats() {
            var text = $(".editor", editor.element)[0].innerText;
            var wordcount = text.split(/\s+/).length - 1;
            var stats = {
                wordcount: wordcount,
                characters: text.length,
                readingtime: wordcount / 225
            }
            $(".wordcount", editor.element).html(wordcount);
            setTimeout(updateStats, 5000);
        }
    }
    global.EditorModules.push(Stats);
})(this)