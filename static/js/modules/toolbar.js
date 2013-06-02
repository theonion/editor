(function(global) {
    'use strict';
    var Toolbar = Toolbar || function(editor, options) {
        var self = this;

        var buttonTemplate = _.template("<button name=\"<%=name%>\" class=\"<%=icon%>\"></button>"); 
        
        editor.on("init", init);

        function init() {
            $(options.element).prepend('<div class="toolbar-wrapper"><div class="toolbar"></div></div>');
            self.toolbarElement = $(options.element).find(".toolbar");

            //handle clicks
            self.toolbarElement.click(function(e) {
                editor.emit("toolbar:click:" + $(e.target).attr("name")); 
            });
            editor.toolbar = {
                addButton: function(buttonOptions) {
                    self.toolbarElement.append( buttonTemplate(buttonOptions) );
                },
                addSpacer: function() {
                    self.toolbarElement.append( "<span class=\"spacer\"></span>" );
                }
            }
            editor.emit("toolbar:ready");
        }
    }
    global.EditorModules.push(Toolbar);
})(this)

