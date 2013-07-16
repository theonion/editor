/* This deals with all Range & Selection stuff. Keeping it all in one place will help make this 
whole thing be cross-browser more easily. Also, this code always looks ugly, so let's keep
it in one place. */

(function(global) {
    'use strict';
    var Selection = Selection || function(editor, options) {
        var self = this;
        var w = global.window;
        var s = w.getSelection();

        self.insertOrReplace = function(html) {
            if (s) {
                if (s.getRangeAt && s.rangeCount) {
                    var range = s.getRangeAt(0);
                    range.deleteContents(); 
                    w.document.execCommand("InsertHTML", false, html);
                }
            }
        }

        //returns true if the cursor is in the editor
        self.hasFocus = function() {
            if (s.focusNode) {
                if ($.contains(options.element, s.focusNode)) {
                    return true;
                }
            }
            return false;
        }

        // returns true there is selected text in the editor
        self.hasSelection = function() {
            if (self.hasFocus()) { //any selection will not suffice, must be in this editor
                if (s.type === "Range") {
                    return true
                }
            }
            return false;
        }


        //returns the parent of the focus node that is the immediate child of the editor itself
        self.getRootParent = function() {
            if (self.hasFocus()) {
                var parents = $(s.focusNode).parentsUntil(".editor")
                if (parents.length > 0) {
                    return parents.slice(-1);
                }
                else {
                    return s.focusNode;
                }
            }
            return null;
        }

        // emit a selction change event. 
        $(w.document).bind("selectionchange",
            function(e) {
                editor.emit("selection:change");
                //do we want to emit a "got focus & lost focus" event? Would require maintaining state.
            }
        );

        // make it possible to call selection methods from other modules
        editor.selection = self;
    }
    global.EditorModules.push(Selection);
})(this)