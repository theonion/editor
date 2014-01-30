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
                if (node.tagName === "P") { //go nuts with paragraphs, but not elsewhere
                    emptyParagraphEnter()
                }

                //Redo this block exclusively using dom manip, not 
                else if (node.tagName == "LI") {
                    emptyListItemEnter();
                }

            }

            function emptyListItemEnter() {
                state = grabState();
                if (state.isLastChild && state.isFirstChild) {
                    e.preventDefault();
                    $(state.node).remove(); // remove the li
                    document.execCommand("formatBlock", false, "P");
                    setTimeout(function() {
                        var nodeToRemove = self.selection.getNonInlineParent()
                        $(nodeToRemove).remove();
                    }, 5)
                
                }
                else if (isFirstChild) {
                    //LI: First item in the list, but list isn't empty. removing node & adding paragraph above"
                    e.preventDefault();
                }
                else if (isLastChild) {
                    // LI: At end of list
                    console.log("LI: At end of list, removing node");
                    e.preventDefault();

                        $(state.node).remove(); 
                        
                        //$(parentNode).after("<span class='tmp'></span>");
                        self.selection.setCaretAfter(state.parentNode);
                        setTimeout(function() {
                            document.execCommand("insertHtml", false, "<p><br></p>");
                        }, 20)
                }
                else if (!isLastChild && !isFirstChild) {
                    //LI: In the middle of the list
                    //e.preventDefault();
                    setTimeout(function() {
                        $(".editor div").remove();
                        document.execCommand("insertHtml", false, "<p><br></p>")
                    })
                }
            }
            function emptyParagraphEnter() {

                //is the empty paragraph in a blockquote?

                // is the "P" inside something? Does it matter?

                //is there a paragraph above, that's empty? turn it into an HR.

                //is there an HR above, no more enters!
                /*
                    if (isBlank && previousChildNode.tagName == "HR") {
                        e.preventDefault(); 
                    }
                    else if (isBlank && node.tagName == "P") {
                        node.outerHTML = "<hr><p class='new-paragraph'>NEW P</p>";
                        window.n = node;
                        setTimeout(function() {
                            console.log("new node", node.outerHTML);
                        }, 5);
                    }
                */
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