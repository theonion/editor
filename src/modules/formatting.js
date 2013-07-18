(function(global) {
    'use strict';
    var Formatting = Formatting || function(editor, options) {
        var self = this;


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
                global.document.execCommand('insertunorderedlist', null, null)
            },
            orderedlist: function() {
                global.document.execCommand('insertorderedlist', null, null)
            },
            blockquote: function() {
                global.document.execCommand('formatBlock', null, '<blockquote>')
            },
            visualize: function() {
                $(options.element).find(".editor").toggleClass("visualize");
            },
            //I don't think these belong here? maybe in base?
            undo: function() {
                global.document.execCommand("undo", false, "");
            },
            redo: function() {
                global.document.execCommand("redo", false, "");
            },
            removeformatting: function() {
                global.document.execCommand("removeformat", false, "");

            }
        }

        key('⌘+b, ctrl+b', commands["bold"]);
        key('⌘+i, ctrl+i', commands["italic"]);
        key('⌘+u, ctrl+u', commands["underline"]);

        editor.on("toolbar:click", function(name) {
            if (typeof commands[name] === "function" ) {
                commands[name]();
            }
        })

        /*
        function _link() {
            if (global.document.execCommand("createLink", true, "#replaceme")) {
                sel = window.getSelection();
                range = sel.getRangeAt(0);
                _editLink(range.commonAncestorContainer.parentElement);    
            }
        }
        */

    }
    global.EditorModules.push(Formatting);
})(this)

