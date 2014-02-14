(function(global) {
    'use strict';
    var Stats = Stats || function(editor, options) {
        var self = this;

        if (options.statsContainer) {
            editor.on("init", updateStats);
            editor.on("contentchanged", updateStats);
        }
        function updateStats() {
            var text = $(".editor", options.element)[0].innerText;
            var wordcount = text.split(/\s+/).length - 1;
            var stats = {
                wordcount: wordcount,
                characters: text.length,
                readingtime: wordcount / 225
            }
            $(options.statsContainer).html(wordcount);
        }
    }
    global.EditorModules.push(Stats);
})(this)