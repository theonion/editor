(function(global){

    'use strict';

    global.EditorModules = []; //a place to keep track of modules

    var Editor = Editor || function(options) {
        var self = this,
        defaults = {
                element: null, /* element to make Editable */
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
            }
        },
        sanitize;

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
                            <div class="editor" contenteditable="true" spellcheck="false">\
                                <p></p>\
                            </div>\
                            <div class="document-tools toolbar"></div>\
                            <div class="selection-tools toolbar"></div>\
                            <div class="embed-overlay"></div>\
                        </div>');
                
            sanitize = new Sanitize(options.sanitize);

            self.emit("init");

            $(options.element)
                .bind("click", function(e) {
                    self.emit("click", e);
                })
                .bind("keydown", function(e) {

                    // handle enter key shit. 
                    if (e.keyCode === 13) {
                        //e.preventDefault();

                        //determine if enter is pressed in an empty node. Do the right thing
                        


                        if (!self.selection.hasSelection() && self.selection.hasFocus()) {
                            var node = self.selection.getAnchorNode();
                            console.log("text: " + $(node).text());
                            if ($(node).text() == "") {
                                console.log("BLANK, DO SOMTHIN");
                                console.log(self.selection.getRootParent());
                                var rootTagName = self.selection.getRootParent().tagName;
                                console.log("rootTag: " + rootTagName);
                                if (rootTagName == "BLOCKQUOTE") {
                                    // Remove current node, 
                                    // Insert new paragraph.
                                    // make sure cursor is in there.

                                    e.preventDefault();
                                }
                                else if (rootTagName == "OL" || rootTagName == "UL") {
                                    // Remove current node, 
                                    
                                    var container = node.parentNode;    
                                    $(node).remove();
                                    $(container).after("<p><br></p>")
                                    var sel = window.getSelection();
                                    var range = document.createRange();
                                    range.selectNodeContents($(container).next()[0]);
                                    range.collapse(true);
                                    sel.removeAllRanges();
                                    sel.addRange(range);
                                    //remove an empty <UL> or <OL>
                                    if ($("li", container).length == 0) {
                                        $(container).remove();
                                    }

                                    e.preventDefault();
                                }
                            }
                        }
                    }
                    else if (e.keyCode === 8) {
                        var sel = window.getSelection()
                        //this happens when the cursor is in the last remaining empty paragraph. 
                        if (sel.focusNode.tagName === "P" && $(".editor>*").length == 1) {
                            e.preventDefault();
                        }
                    }
                    self.emit("keydown", e);
                })
                .bind("keyup", function(e) {
                    self.emit("keyup", e);
                })
                .bind("paste", function(e) {
                    /* this doesn't look very pretty & it bothers me. Probably a cleaner way to do this? */
                    var pastedHTML = e.originalEvent.clipboardData.getData('text/html');
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

        options = $.extend(defaults, options);


        init(options);
    }
    global.Editor = Editor;

})(this)