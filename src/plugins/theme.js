(function(global) {
    'use strict';
    var Theme = Theme || function(editor, options) {
        var self = this;

        editor.on("init", init);

        function init() {
            $(options.element)
                .addClass(options.settings.font)
                .addClass(options.settings.color)
        }

        var opts = {
            color: ["light", "dark"],
            font: ["monospace", "sans-serif", "serif"]
        } 

        editor.on("toolbar:click", function(name) {
            if (name === "font" || name === "color") {
                var i = opts[name].indexOf(options.settings[name]);
                if (i == opts[name].length -1) {
                    i = 0;
                }
                else {
                    i++;
                }
                $(options.element)
                    .removeClass(opts[name].join(" "))
                    .addClass(opts[name][i]);
                editor.updateSetting(name, opts[name][i]);
            }
        })
    }
    global.EditorModules.push(Theme);
})(this)