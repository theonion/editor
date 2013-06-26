(function(global) {
    'use strict';
    var Toolbar = Toolbar || function(editor, options) {
        var self = this;
        
        editor.on("init", init);

        function init() {
            self.toolbarElement = $(options.element).find(".toolbar");

            //handle clicks
            self.toolbarElement.click(function(e) {
                editor.emit("toolbar:click:" + $(e.target).attr("name")); 
            });
            editor.emit("toolbar:ready");
        }
    }
    global.EditorModules.push(Toolbar);
})(this)

