(function(global) {
    'use strict';
    var Toolbar = Toolbar || function(editor, options) {
        var self = this;
        
        editor.on("init", init);

        //TODO: localize these events just to the editor instance
        $(document).bind("selectionchange", update);

        function update(e) {
            setTimeout(
                function() {
                    //check if selection is in the editor itself.
                    if (document.getSelection().focusNode 
                        && $(document.getSelection().focusNode.parentNode).parents(".editor")) {

                        if (document.getSelection().type === "Range") {
                            var posY = $($(document.getSelection().focusNode)).parents("p").position().top -50;
                            //position this badboy based on the paragraph
                            $(".selection-tools").css({top: posY})
                            $(".selection-tools").show();
                            $(".paragraph-tools").hide();

                        }
                        else if (document.getSelection().type === "Caret") {
                            var posY = $($(document.getSelection().focusNode)).parents("p").position().top;
                            $(".paragraph-tools").css({top: posY})
                            $(".selection-tools").hide();
                            $(".paragraph-tools").show();
                        }
                        else {
                            $(".selection-tools,.paragraph-tools").hide();
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
                console.log(e);
                editor.emit("toolbar:click:" + $(e.target).attr("name")); 
            });
            editor.emit("toolbar:ready");
        }
    }
    global.EditorModules.push(Toolbar);
})(this)

