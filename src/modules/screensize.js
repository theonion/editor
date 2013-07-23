
(function(global) {
    'use strict';
    var Screensize = Screensize || function(editor, options) {
        var self = this;
        var sizes = ["mobile", "desktop", "tablet"];
        editor.on("toolbar:click", function(name) {
            if (sizes.indexOf(name) !== -1) {
                $(options.element)
                	.removeClass(sizes.join(" "))
                	.addClass(name);
            }
        })
    }
    global.EditorModules.push(Screensize);
})(this)