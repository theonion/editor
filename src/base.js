(function(global){

    'use strict';

    global.EditorModules = []; //a place to keep track of modules

    var Editor = Editor || function(options) {
        var self = this,
        defaults = {
                element: null, /* element to make Editable */
                content: "<p><br></p>",
                allowNewline: true,
                sanitize: {
                  elements: ['b', 'em', 'i', 'strong', 'u', 'p','blockquote','a', 'ul', 'ol', 'li','br'],
                  attributes: {'a': ['href', 'title']},
                  remove_contents: ['script', 'style', ],
                  protocols: { a: { href: ['http', 'https', 'mailto']}},
                },
                /* settings gets serialized & dumped to local storage. put things you want to persist in here */
                settings: {} 
        },
        moduleInstances = [],
        utils = { /* a place for non-editor specific function calls */
            enableEvents: function (obj) {
                obj.__listeners__ = obj.__listeners__ || {};

                obj.on = function on(evt, fn) {
                    var fns = obj.__listeners__[evt] || (obj.__listeners__[evt] = []);
                    fns.push(fn);
                };

                obj.off = function off(evt, fn) {
                    var fns = obj.__listeners__[evt] || [];
                    var updated = [];

                    for (var n = 0, l = fns.length; n < l; n++) {
                        if (fns[n] !== fn) updated.push(fns[n]);
                    }

                    obj.__listeners__[evt] = updated;
                };

                obj.emit = function emit (evt) {
                    var args = Array.prototype.slice.call (arguments, 1) ;
                    var fns = obj.__listeners__[ evt ] || [];

                    for (var n = 0, l = fns.length; n < l; n++) {
                        try {
                            fns[n].apply(null, args);
                        }
                        catch (e) {}
                    }
                };
            },
            // really basic templating
            template: function(html, dict) {
                for (k in dict) {
                    html = html.replace("{{" + k + "}}", dict[k]);
                }
                return html;
            }
        },
        sanitize;


        function isEmptyCheck() {
            //if the editor is empty, show the placeholder. 
            if ($(".editor", options.element).text() === "") {
                $(".editorPlaceholder", options.element).show();
            }
            else {
                $(".editorPlaceholder", options.element).hide();
            }
        }
        function loadSettings() {
            if (localStorage.editorSettings) {
                options.settings = JSON.parse(global.localStorage.editorSettings)
            }
        }
        self.updateSetting = function(key, value) {
            options.settings[key] = value;
            global.localStorage.editorSettings = JSON.stringify(options.settings);
        }

        function init(options) {  
            loadSettings();
            for (var i=0;i<global.EditorModules.length;i++) {
                moduleInstances.push(new global.EditorModules[i](self, options));
            }
            
            $(options.element)
                .append('<div class="editor-wrapper">\
                            <div class="editorPlaceholder"></div>\
                            <div class="editor" contenteditable="true" spellcheck="false">\
                                <p></p>\
                            </div>\
                            <div class="document-tools toolbar"></div>\
                            <div class="selection-tools toolbar"></div>\
                            <div class="embed-overlay"></div>\
                        </div>');
                

            $(".editorPlaceholder", options.element).html(options.placeholder);
            sanitize = new Sanitize(options.sanitize);

            self.setContent(options.content);

            isEmptyCheck();

            self.emit("init");

            $(options.element)
                .bind("click", function(e) {
                    self.emit("click", e);
                })
                .bind("keydown", function(e) {
                    
                    /* for undo */
                    var beforeState = self.getContent();

                    var node = self.selection.getNonInlineParent();
                    
                    var previousChildNode = $(node).prev()[0];


                    var parentNode = node.parentNode || node;
                    var isParentRoot = $( parentNode).hasClass("editor");
                    var isBlank = ($(node).text() === "");
                    var isPreviousChildBlank = ($(previousChildNode).text() === "");
                    var isFirstChild = (typeof previousChildNode === "undefined");
                    var isLastChild = (typeof $(node).next()[0] === "undefined");
                    var isTextSelected = self.selection.hasSelection();

                    /*
                    console.log(" nodeName: " + node.tagName +
                                " parentNodeName: " + parentNode.tagName +
                                " isParentRoot: " + isParentRoot + 
                                " isBlank: " + isBlank + 
                                " isPreviousChildBlank: " + isPreviousChildBlank + 
                                " isFirstChild: " + isFirstChild + 
                                " isLastChild: " + isLastChild + 
                                " isTextSelected: " + isTextSelected
                        )
                    */

                    // handle enter key shit. 
                    if (e.keyCode === 13 && !e.shiftKey) {

                        if (isTextSelected || !options.allowNewline) {  
                            // shit gets weird when enter is pushed and text is selected. Nobody does this
                            e.preventDefault();
                        }
                        else if (isBlank) { //enter was hit in an empty node.
                            //$(node).remove();
                            if (node.tagName === "P") { //go nuts with paragraphs, but not elsewhere
                                // is the "P" inside something? Does it matter?
                            }
                            else if (node.tagName == "LI") {
                                if (isLastChild && isFirstChild) {
                                    e.preventDefault();
                                    console.log("LI: Only item in list. removing");
                                    $(node).remove(); // remove the li
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
                                    // LI: At end of list, removing node
                                    e.preventDefault();

                                        $(node).remove(); 
                                        
                                        //$(parentNode).after("<span class='tmp'></span>");
                                        self.selection.setCaretAfter(parentNode);
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

                        }
                    }
                    else if (e.keyCode === 8) {
                        self.emit("backspace");
                        var sel = window.getSelection()
                        //this happens when the cursor is in the last remaining empty paragraph. 
                        if (sel.focusNode.tagName === "P" && $(".editor>*").length == 1) {
                            e.preventDefault();

                            // do we want to "merge adjacent lists if they are of the same type"
                        }
                        
                    }
                    setTimeout(isEmptyCheck, 50);

                    clearTimeout(self.undoTimeout);
                    self.undoTimeout =  setTimeout(function() {
                        var afterState = self.getContent();

                        //self.options.undo.addCommand(self, "typing", beforeState, afterState);
                    }, 250)

                    self.emit("keydown", e);
                })
                .bind("keyup", function(e) {
                    self.emit("keyup", e);
                })
                .bind("paste", function(e) {

                    var pastedHTML = e.originalEvent.clipboardData.getData('text/html');
                    //prefer html, but take text if it's not avaialble
                    if (pastedHTML === "") {
                        pastedHTML = e.originalEvent.clipboardData.getData('text/plain');
                    }
                    var fragment = document.createDocumentFragment();
        
                    fragment.appendChild(document.createElement("div"))
                    fragment.childNodes[0].innerHTML = pastedHTML;
                    var cleanFrag =  sanitize.clean_node(fragment.childNodes[0]);
                    var cleanHTML = "";
                    for (var i = 0; i < cleanFrag.childNodes.length; i++) {
                        var node = cleanFrag.childNodes[i];
                        if (node.nodeType == 3) {
                            cleanHTML += node.nodeValue;
                        }
                        else if (node.nodeType == 1) {
                            if (!cleanFrag.childNodes[i].innerText == "") { // exclude tags with no content
                                cleanHTML += cleanFrag.childNodes[i].outerHTML;
                            }
                        }
                    }

                    self.selection.insertOrReplace(cleanHTML)

                    e.preventDefault();




                    self.emit("paste");
                    
                })
        };

        utils.enableEvents(self);

        self.setContent = function(contentHTML) {
            $(options.element).find(".editor").html(contentHTML);
        }
        self.getContent = function(contentHTML) {
            return $(options.element).find(".editor").html();
        }
        options = $.extend(defaults, options);

        init(options);
    }
    global.Editor = Editor;

})(this)