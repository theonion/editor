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
                            $(".selection-tools").css({top: blockTop  - 50})
                            $(".selection-tools").show();
                            $(".paragraph-tools").hide();

                        }
                        else {
                            $(".paragraph-tools").css({top: blockTop})
                            $(".selection-tools").hide();
                            $(".paragraph-tools").show();
                        }
                    }
                    else {
                        $(".selection-tools,.paragraph-tools").hide();                        
                    }
                }   
            , 5);
        }

        function init() {

            $(options.element).find(".document-tools").html(options.toolbar.documentTools);
            $(options.element).find(".paragraph-tools").html(options.toolbar.paragraphTools);
            $(options.element).find(".selection-tools").html(options.toolbar.selectionTools);


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

