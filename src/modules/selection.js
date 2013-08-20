/* This deals with all Range & Selection stuff. Keeping it all in one place will help make this 
whole thing be cross-browser more easily. Also, this code always looks ugly, so let's keep
it in one place. 

Now that I'm using RANGY, some of this stuff needs to be revisited. 

*/

(function(global) {
    'use strict';
    var Selection = Selection || function(editor, options) {
        var self = this;
        var w = global;
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
            var s = w.getSelection();
            if (self.hasFocus()) { //any selection will not suffice, must be in this editor
                //TODO: This doesn't work in firefox. 
                if (s.type === "Range") {
                    return true
                }
            }
            return false;
        }

        
        self.getCoordinates = function () {
            var sel = document.selection, range;
            var x = 0, y = 0;
            if (window.getSelection) {
                sel = window.getSelection();
                if (sel.rangeCount) {
                    range = sel.getRangeAt(0).cloneRange();
                    if (range.getClientRects) {
                        range.collapse(true);
                        var rect = range.getClientRects()[0];
                        console.log(range.getClientRects()[0]);
                        x = rect.left;
                        y = rect.top;
                    }
                }
            }
            return { x: x, y: y };
        }


        //returns the parent of the focus node that is the immediate child of the editor itself
        self.getRootParent = function() {
            if (self.hasFocus()) {
                var parents = $(s.anchorNode).parentsUntil(".editor")
                if (parents.length > 0) {
                    return parents.slice(-1)[0];
                }
                else {
                    return s.anchorNode;
                }
            }
            return null;
        }

        self.getAnchorNode = function() {
            return s.anchorNode;
        }
        self.getFocusNode = function() {
            return s.focusNode;
        }
        self.setCaretBefore = function(node) {
            var range = document.createRange();
            var sel = window.getSelection();
            range.setStartBefore(node);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }

        self.setCaretAfter = function(node) {
            var range = document.createRange();
            var sel = window.getSelection();
            range.setStartAfter(node);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }

        self.getNonInlineParent = function() {
            var anchorNode = self.getAnchorNode();

            if (anchorNode.nodeType == 3 || $(anchorNode).css("display") === "inline") {
                var node;
                var parents = $(anchorNode).parentsUntil(".editor");
                for (var i =0; i < parents.length; i++) {
                    if ($(parents[i]).css("display") !== "inline") {
                        node = parents[i];
                        break;
                    }
                }
                if (!node) {
                    node = anchorNode;
                }
                return node;
            }
            else {
                return anchorNode;
            }
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