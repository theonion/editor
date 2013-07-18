(function(global) {
    'use strict';
    var Toolbar = Toolbar || function(editor, options) {
        var self = this;
        
        editor.on("init", init);

        //TODO: localize these events just to the editor instance
        
        editor.on("selection:change", update);
        function update(e) {
            setTimeout( //give the browser a chance to catch up
                function() {
                    //check if selection is in the editor itself.
                    var currentBlockNode = editor.selection.getRootParent();
                    if (currentBlockNode) {
                        var blockTop = $(currentBlockNode).position().top;
                        if (editor.selection.hasSelection()) {
                            $(".selection-tools").css({top: blockTop  - 35})
                            $(".selection-tools").show();
                            return;
                        }
                    }
                    $(".selection-tools").hide();
                }   
            , 5);
        }

        function init() {

            $(options.element).find(".document-tools").html(options.toolbar.documentTools);
            $(options.element).find(".selection-tools").html(options.toolbar.selectionTools);


            self.toolbarElement = $(options.element).find(".toolbar");  

            //handle clicks
            self.toolbarElement.click(function(e) {
                editor.emit("toolbar:click", $(e.target).attr("name")); 
            });

            self.toolbarElement.bind("mouseover", function(e) {
                editor.emit("toolbar:over", $(e.target).attr("name")); 
            });

            self.toolbarElement.bind("mouseout", function(e) {
                editor.emit("toolbar:out", $(e.target).attr("name")); 
            });

            editor.emit("toolbar:ready");
        }
    }
    global.EditorModules.push(Toolbar);
})(this)

