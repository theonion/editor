(function(global) {
    'use strict';
    var Toolbar = Toolbar || function(editor, options) {
        var self = this;
        
        editor.on("init", init);

        //TODO: localize these events just to the editor instance
        
        editor.on("selection:change", update);

        var scrollTimeout;
        $(window).scroll(function() {
            clearTimeout(scrollTimeout);
            if (editor.selection.hasSelection()) {
                $(".selection-tools",  options.element).hide();
                scrollTimeout = setTimeout(
                    function() {
                        update();
                        //$(".selection-tools",  options.element).show();
                    }
                , 250);
            };
        });

        function update(e) {
            if (options.toolbar.selectionTools) {
                setTimeout( //give the browser a chance to catch up
                    function() {
                        //check if selection is in the editor itself.
                        var currentBlockNode = editor.selection.getTopLevelParent();
                        if (currentBlockNode) {
                            var blockTop = $(currentBlockNode).position().top;
                            if (editor.selection.hasSelection()) {
                                var coords = editor.selection.getCoordinates();
                                $(".selection-tools",  options.element).css({top: coords.top - 55, left: coords.left})
                                $(".selection-tools",  options.element).show();
                                return;
                            }
                        }
                        $(".selection-tools", options.element).hide();
                    }   
                , 5);
            }
        }

        function init() {
            if (options.toolbar.documentTools) {
                $(options.element).find(".document-tools").html(options.toolbar.documentTools);
            }
            else {
                $(options.element).find(".document-tools").hide();
            }
            if (options.toolbar.selectionTools) {
                $(options.element).find(".selection-tools").html(options.toolbar.selectionTools);
            }
            else {
                $(options.element).find(".selection-tools").hide();
            }

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

