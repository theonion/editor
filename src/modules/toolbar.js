(function(global) {
    'use strict';
    var Toolbar = Toolbar || function(editor, options) {
        var self = this;
        
        editor.on("init", init);

        //TODO: localize these events just to the editor instance
        
        editor.on("selection:change", update);


        function update(e) {

            var tagNames = editor.selection.getTagnamesInRange();
            $(".document-tools button", options.element).removeClass("active");
            for (var i = 0; i<tagNames.length; i++) {
                $(".document-tools button[tag=" + tagNames[i] + "]", options.element).addClass("active");
            }
        }

        function init() {
            if (options.toolbar.documentTools) {
                $(".document-tools", options.element).html(options.toolbar.documentTools);
            }
            else {
                $(".document-tools", options.element).hide();
            }
            
            if (options.toolbar.embedTools) {
                $(".embed-tools", options.element).html(options.toolbar.embedTools);
            }
            if (options.toolbar.linkTools) {
                $(".link-tools", options.element).html(options.toolbar.linkTools);
            }
            if (options.toolbar.inlineTools) {
                $(".inline-tools", options.element).html(options.toolbar.inlineTools);
            }


            //mouse events for embed toolbar


            $(".editor", options.element).mousemove( function(e) {
                var node = $(".editor>*:hover");
                if (node.length == 1) {
                    $(".embed-tools", options.element)
                        .css({ top:$(node).position().top - 4  })
                        .addClass("active");
                }
                else {
                    $(".embed-tools", options.element).removeClass("active");
                }
            });


            self.toolbarElement = $(options.element).find(".toolbar");  

            //handle clicks
            function getButtonName(e) {
                if (e.target.tagName === "BUTTON") {
                    var el = $(e.target);
                }
                else {
                    var el = $(e.target).parents('button')
                }
                return el.attr("name");
            }

            self.toolbarElement.click(function(e) {
                editor.emit("toolbar:click", getButtonName(e)); 
            });
            
            self.toolbarElement.bind("mousedown", function() {
                editor.stashState()
            })
            
            self.toolbarElement.bind("mouseover", function(e) {
                editor.emit("toolbar:over", getButtonName(e)); 
            });

            self.toolbarElement.bind("mouseout", function(e) {
                editor.emit("toolbar:out", getButtonName(e)); 
            });
            
            editor.emit("toolbar:ready");
        }
    }
    global.EditorModules.push(Toolbar);
})(this)

