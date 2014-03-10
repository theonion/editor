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
            if ( (sel && !sel.isCollapsed) ) {
                if ($.contains(options.element, sel.focusNode)) {
                    return true;
                }
            }   
            return false
        },
        
        self.getCoordinates = function () {
            //console.log("DEPRECATED: getCoordinates");
            var sel = document.selection, range;
            var top = 0, left = 0;
            if (window.getSelection) {
                sel = window.getSelection();
                if (sel.rangeCount) {
                    range = sel.getRangeAt(0).cloneRange();
                    if (range.getClientRects) {
                        range.collapse(true);
                        //these are relative to the viewport
                        var rect = range.getClientBoundingRects();

                        //let's find position relative to page.
                        left = rect.left + document.body.scrollLeft - $(options.element).position().left;
                        top = rect.top + document.body.scrollTop -  $(options.element).position().top;
                    }
                }
            }
            return {top: top, left: left};
        }

        /*wrapper for rangy's getSelection. Only returns a value if the focus is 
          within the current instances of the editor
        */
        self.getSelection = function() {
            var sel = rangy.getSelection();
            if (sel.rangeCount == 1) {
                if ($.contains(options.element, sel.focusNode)) {
                    return sel;

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
            var sel = rangy.getSelection();
            var range = rangy.createRangyRange();
            range.setStartBefore(nodes[0]);
            range.setEndAfter(nodes[nodes.length-1].lastChild);
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
            var sel = self.getSelection();

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

        //list of tagnames within current selection
        self.getTagnamesInRange = function() {
            var sel = self.getSelection();
            if (sel) {
                if (sel.isCollapsed) {
                    var nodes = [sel.anchorNode];
                }
                else {
                    var nodes = sel._ranges[0].getNodes();
                }
                var tagNames = [];
                for (var i = 0; i < nodes.length; i++) {
                    
                    var parents = $(nodes[i]).parentsUntil(".editor");
                    parents.push(nodes[i]);

                    for (var j = 0; j < parents.length; j++) {
                        if (parents[j].nodeType !==3 && tagNames.indexOf(parents[j].tagName) === -1) {
                            tagNames.push(parents[j].tagName);
                        }
                    }
                }
                return tagNames;
            }
            else {
                return [];
            }
        }

        var selectionTimeout;
        // emit a selction change event. 
        //TODO: Make it fire for a only within the  editor
        
        $(w.document).bind("selectionchange",
            function(e) {
                clearTimeout(selectionTimeout);
                selectionTimeout = setTimeout(function() {
                    editor.emit("selection:change");
                }, 100);
            }
        );
        // make it possible to call selection methods from other modules
        editor.selection = self;
    }
    global.EditorModules.push(Selection);
})(this)