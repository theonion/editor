/*  This handles all the ugliness of managing what happens when certain keys are pressed.
    Primarily, <Enter> and <Backspace>. Making sure the right thing happens to the document
    structure requires handling some edge cases reuquires overriding the browser's 
    default behavior. 

    Lots of 
*/

(function(global) {
    'use strict';
    var Typing = Typing || function(editor, options) {
        var self = this,
            state;
        


        self.handleSpace = function() {
            // is previous character a space? preventDefault!
        }
        
        self.handleEnter = function() {
            // li, blockquote, paragraph, 
            state = grabState();
            if (state.isTextSelected || !options.allowNewline) {  
                // shit gets weird when enter is pushed and text is selected. Nobody does this
                e.preventDefault();
            }
            else if (isBlank  && !e.shiftKey) { //enter was hit in a node with no textContent

                

            }

        }

        self.handleBackspace = function() {
            state = grabState();
            var sel = self.selection.getSelection()

            //this happens when the cursor is in the last remaining empty paragraph. 
            if (sel.focusNode.tagName === "P" && $(".editor>*").length == 1) {
                e.preventDefault();
            }

            // If the cursor is in the first position of a paragraph, the normal ba
            
            //is the previous element an inline element
            if (typeof $(state.previousChildNode).attr("data-type") !== 'undefined' ) {
                //is the cursor in the first position of the current node.
                
                if (sel.anchorOffset === 0 && sel.isCollapsed) {
                    e.preventDefault();
                }
            }
        }

        function grabState() {
            var node = editor.selection.getBlockParent();
            var previousChildNode = $(node).prev()[0];
            var parentNode = node.parentNode || node;
            return {
                node: node,
                previousChildNode: $(node).prev()[0],
                parentNode: node.parentNode || node,
                isParentRoot: $( parentNode).hasClass("editor"),
                isBlank: ($(node).text() === ""),
                isPreviousChildBlank: ($(previousChildNode).text() === ""),
                isFirstChild: (typeof previousChildNode === "undefined"),
                isLastChild: (typeof $(node).next()[0] === "undefined"),
                isTextSelected: editor.selection.hasSelection()
            }
            
        }




    }
    editor.typing = self;
})(this);