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


        // TODO: REWRITE USING ONLY RANGY CALLS

        self.insertOrReplace = function(html) {
            console.log("DEPRECATED: insertOrReplace");
            if (s) {
                if (s.getRangeAt && s.rangeCount) {
                    var range = s.getRangeAt(0);
                    range.deleteContents(); 
                    w.document.execCommand("InsertHTML", false, html);
                }
            }
        }

        
        self.hasFocus = function() {
            var sel = self.getSelection();
            if (sel) {
                return true;
            }
            else {
                return false;
            }
        }

        // returns true there is selected text in the editor
        self.hasSelection = function() {
            var sel = self.getSelection();
            if (sel && sel.isCollapsed) {
                return false;
            }
            else {
                return true;
            }
        }

        
        self.getCoordinates = function () {
            //console.log("DEPRECATED: getCoordinates");
            var sel = document.selection, range;
            var x = 0, y = 0;
            if (window.getSelection) {
                sel = window.getSelection();
                if (sel.rangeCount) {
                    range = sel.getRangeAt(0).cloneRange();
                    if (range.getClientRects) {
                        range.collapse(true);
                        var rect = range.getClientRects()[0];
                        x = rect.left;
                        y = rect.top;
                    }
                }
            }
            return rect;
        }

        /*wrapper for rangy's getSelection. Only returns a value if the focus is 
          within the current instances of the editor
        */
        self.getSelection = function() {
            var sel = rangy.getSelection();
            if (sel.rangeCount == 1) {
                if ($.contains(options.element, sel.focusNode)) {
                    if (!sel.isCollapsted) {
                        return sel;
                    }
                }
            }
            return null
        }


        self.getTopLevelParent = function() {
            var sel = self.getSelection();
            if (sel) {
                var parents = $(sel.anchorNode).parentsUntil(".editor")
                if (parents.length > 0) {
                    return parents.slice(-1)[0];
                }
                else {
                    return sel.anchorNode;
                }
            }
            return null;
        }

        self.setCaretBefore = function(node) {
            console.log("DEPRECATED: setCaretBefore");

            var range = document.createRange();
            var sel = window.getSelection();
            range.setStartBefore(node);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }

        self.setCaretAfter = function(node) {
            console.log("DEPRECATED: setCaretAfter");
            var range = document.createRange();
            var sel = window.getSelection();
            range.setStartAfter(node);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }

        
        self.selectNode = function(node) {
            //parameter is 

            var el = $(node)[0]
            var range = rangy.createRange();
            range.selectNodeContents(el);
            var sel = rangy.getSelection();
            sel.setSingleRange(range);
        }

        self.selectNodes = function(nodes) {
            nodes = $.makeArray(nodes);
            console.log(nodes);

            var sel = rangy.getSelection();
            //sel.collapse(document.body, 0); //clear the selection, maybe wrong
            /*
            var ranges = [];
            for (var i = 0; i < nodes.length; i++) {
                var range = rangy.createRange();
                ranges.push(range);
            }
            */
            var range = rangy.createRangyRange();
            range.setStartBefore(nodes[0]);
            range.setEndAfter(nodes[nodes.length-1]);

            sel.setSingleRange(range);
        }

        self.getBlockParent = function() {
            var sel = self.getSelection();
            var anchorNode = sel.anchorNode;

            if (anchorNode.nodeType == 3 || $(anchorNode).css("display") === "inline") {
                var node;
                var parents = $(anchorNode).parentsUntil(".editor");
                for (var i =0; i < parents.length; i++) {
                    if ($(parents[i]).css("display") === "block") {
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
        self.getNonInlineParent = self.getBlockParent;
        /* UPDATED API HERE */


        self.nodeDepth = function(node) {
            return $(node).parentsUntil(".editor").length;
        }

        function isBlock(node) {
            //return (['P', 'BLOCKQUOTE', 'UL', 'OL', 'LI', 'DIV'].indexOf(node.nodeName) !== -1)
            return $(node).css("display") === "block" && node.nodeType !== 3;
        }

        /* Grab a list of siblings that are block elements */
        //includes LI, maybe not a good name.  Excludes Textnodes & inline elements. 
        self.getSelectedBlockNodes = function() {
            var sel = self.getSelection()
            if (sel) {
                var nodes = sel._ranges[0].getNodes(null, isBlock);
                //The selection is completely within a block element, or there is no selection just focus
                if (nodes.length == 0) {
                    return [ self.getNonInlineParent() ]
                }
                else {
                    var topDepth = 999;
                    var nodesByDepth = {}
                    for (var i = 0; i < nodes.length; i++) {
                        var depth = self.nodeDepth(nodes[i]);
                        topDepth = Math.min(topDepth, depth);
                        if (!nodesByDepth[depth]) {
                            nodesByDepth[depth] = [];
                        }
                        //TODO: We're including an extra node here sometimes. It's not visibly selected. http://cg.cg/m/04WAO.png 
                        nodesByDepth[depth].push(nodes[i]);
                    }
                    return nodesByDepth[topDepth];
                }
            }
            else {
                return [];
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