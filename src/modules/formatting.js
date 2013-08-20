(function(global) {
    'use strict';
    var Formatting = Formatting || function(editor, options) {
        var self = this;

        editor.on("init", init);

        function init() {
            if (options.settings.visualize) {
                $(options.element)
                    .addClass("visualize");
            }

            key('⌘+b, ctrl+b', commands["bold"]);
            key('⌘+i, ctrl+i', commands["italic"]);
            key('⌘+u, ctrl+u', commands["underline"]);

            editor.on("toolbar:click", function(name) {
                if (typeof commands[name] === "function" ) {
                    commands[name]();
                }
            })
        }

        var commands = {
            bold : function() {
                global.document.execCommand("bold");
            },
            italic: function() {
                global.document.execCommand("italic");
            },
            underline: function() {
                global.document.execCommand("underline");
            },
            strikethrough: function() {
                global.document.execCommand("strikethrough");
            },
            superscript: function() {
                global.document.execCommand("superscript");
            },
            subscript: function() {
                global.document.execCommand("subscript");
            },
            unorderedlist: function() {
                
            },
            orderedlist: function() {
                
            },
            blockquote: function() {

            },
            visualize: function() {
                editor.updateSetting("visualize", 
                    $(options.element)
                        .toggleClass("visualize")
                        .hasClass("visualize"));
            },

            removeformatting: function() {
                global.document.execCommand("removeformat", false, "");

            }
        }



    }
    global.EditorModules.push(Formatting);
})(this)

