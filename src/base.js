(function(global){

    'use strict';

    global.EditorModules = []; //a place to keep track of modules

    /* from http://ejohn.org/blog/javascript-array-remove/ */
    Array.prototype.remove = function(from, to) {
      var rest = this.slice((to || from) + 1 || this.length);
      this.length = from < 0 ? this.length + from : from;
      return this.push.apply(this, rest);
    };

    var Editor = Editor || function(options) {
        var self = this;

        
        self.content = {"blocks": []};
        self.sanitize = {};



        var defaults = {
                element: null, /* element to make Editable */
                html: "",
                allowNewline: true,
                sanitize: {
                  elements: ['b', 'em', 'i', 'strong', 'u','a', 'br', 'sub', 'sup', 's', 'li'],
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
                for (var k in dict) {
                    if (k) {
                        html = html.replace(new RegExp("{{" + k + "}}", 'g'), dict[k]);
                    }
                }
                return html;
            }
        },
        domChangeTimeout;

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
                //  options.settings = JSON.parse(global.localStorage.editorSettings)
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
                            <div class="editor" contenteditable="true" spellcheck="true">\
                                <p></p>\
                            </div>\
                            <div class="document-tools toolbar"></div>\
                            <div class="embed-tools toolbar"></div>\
                            <div class="link-tools toolbar"></div>\
                            <div class="inline-tools toolbar"></div>\
                        </div>');
                


            //block drag/drop of text
            $(options.element).bind('dragover drop', function(event){
                event.preventDefault();
                return false;
            });
            $(".editorPlaceholder", options.element).html(options.placeholder);
            
            self.sanitize = new Sanitize(options.sanitize);

            self.setContent(options.html);

            isEmptyCheck();

            self.emit("init");

            self.listenForChanges(); //triggers undo & other items that require 

            $(".editor", options.element)
                .bind("mousedown", function() {
                    
                })
                .bind("click", function(e) {
                    self.emit("click", e);
                    e.preventDefault();
                })
                .bind("keydown", function(e) {
                    /*  This type of stuff should move into formatting, but not sure how yet. */
                    var sel = rangy.getSelection();
                    var block = $(sel.anchorNode).closest(".block")[0];
                    var endBlock = $(sel.focusNode).closest(".block")[0];

                    //make sure there is something actually selected in the start & endblock

                    var isTextSelected = self.selection.hasSelection();
                    //console.log(block);


                    var selectedBlockNodes = self.selection.getSelectedBlockNodes();
                    var endPoints = self.selection.getEndPoints();

                    console.log(selectedBlockNodes);
                    //get a list of blocks, in order within the selection. Check for backwards selection


                    if (e.keyCode === 13) {
                        e.preventDefault();

                        if (isTextSelected || !options.allowNewline) {  
                            // shit gets weird when enter is pushed and text is selected. Nobody does this
                            e.preventDefault();
                        }
                        else {
                            var range = rangy.createRange();
                            //to the end of the current block
                            
                            //select from the current position of the node
                            range.setStart(sel.anchorNode, sel.anchorOffset);
                            range.setEndAfter(block);
                            var newFragment = range.cloneContents();
                            range.deleteContents();

                            self.blockTools.insertBlocksAfter(block.id, 
                                self.content.blocks, self.blockTools.fragmentToBlocks(newFragment, true)
                            );

                        }
                    }
                    else if (e.keyCode === 8) {
                        if (selectedBlockNodes.length > 1) {                            
                            console.log("deleting across blocks.")
                            for (var i=0;i<selectedBlockNodes.length;i++) {

                                // there will be an opportunity to abstract this range manipulation. But for now...
                                if ($.contains(selectedBlockNodes[i], endPoints.startNode)) { 
                                    var range = rangy.createRange();
                                    range.setStart(endPoints.startNode, endPoints.startOffset);
                                    range.setEndAfter(selectedBlockNodes[i]);
                                    range.deleteContents();
                                }
                                else if ($.contains(selectedBlockNodes[i], endPoints.endNode)) {
                                    var range = rangy.createRange();
                                    range.setStartBefore(selectedBlockNodes[i]);
                                    range.setEnd(endPoints.endNode, endPoints.endOffset);
                                    range.deleteContents();
                                }
                                else {
                                    self.blockTools.removeBlock(selectedBlockNodes[i].id, self.content.blocks);
                                }
                            }
                            console.log(selectedBlockNodes);
                            self.blockTools.mergeAdjacentBlocks(
                                selectedBlockNodes[0].id,
                                selectedBlockNodes[selectedBlockNodes.length - 1].id,
                                self.content.blocks
                            );

                            e.preventDefault();
                        }
                        else if (sel.anchorOffset === 0) {
                            e.preventDefault();
                            console.log("anchorOffset is zero");
                        }
                    }
                    else {
                        if (block !== endBlock) {
                            e.preventDefault();
                        }
                        else {
                            setTimeout(function() {
                                self.blockTools.syncBlockContent(block.id, self.content.blocks);
                            }, 50);                        
                        }

                    }


                    setTimeout(isEmptyCheck, 50);

                    self.emit("keydown", e);
                })
                .bind("keyup", function(e) {
                    self.emit("keyup", e);
                })
                .bind("paste", function(e) {
                    e.preventDefault();
                    var pastedContent = e.originalEvent.clipboardData.getData('text/html');
                    console.log("Raw paste: ", pastedContent)
                    //prefer html, but take text if it's not avaialble
                    if (pastedContent === "") { // this is plaintext!
                        pastedContent = e.originalEvent.clipboardData.getData('text/plain');
                        self.blocks.insertFromText(pastedContent);
                    }
                    else {
                        self.blocks.insertFromHTML(pastedContent);
                    }
                })
        };

        self.destroy = function() {
            console.log("Emitting Destroy");
            self.emit("destroy");
            //delete self;
        }

        utils.enableEvents(self);

        self.utils = utils;

        self.serializeRange = function() {
            try { 
                var s =  rangy.serializeSelection(rangy.getSelection(), true, $(".editor", options.element)[0]);
                return s;
            }
            catch (e) {
                return "";
            }
        }

        self.deserializeRange = function(serializedRange) {
            if (serializedRange !== "") {
                rangy.deserializeSelection(serializedRange, $(".editor", options.element)[0])
            }
            else {
                //remove focus from contenteditable elmenet by putting the cursor in another one. 
               self.killFocus()
            }
        }
        

        function changed() {
            clearTimeout(domChangeTimeout);
            domChangeTimeout = setTimeout(function() {
                self.emit("contentchanged");
                if (typeof options.onContentChange === "function") {
                    options.onContentChange(self);
                }
            }, 500);
        }


        self.killFocus = function () {
            $('<div style="position:fixed; top:0;" contenteditable="true"></div>').appendTo('body').focus().remove()
        }
        self.listenForChanges = function() {
           $(".editor", options.element)
                .bind("DOMSubtreeModified", changed )
        }
        self.dontListenForChanges = function() {
           $(".editor", options.element)
                .unbind("DOMSubtreeModified", changed )
        }

        //takes re
        self.renderContent = function() {
            var parsedFragment = self.blockTools.blocksToFragment(self.content.blocks);
            $(".editor", options.element).html(parsedFragment);
            $(".inline", options.element).attr("contenteditable", "false");
        }

        /* FOR EXTERNAL USE ONLY undo/redo should use blocklists*/
        //sets content from HTML
        self.setContent = function(contentHTML) {
            contentHTML = contentHTML.replace(/\n/g, " ");
            var fragment = document.createDocumentFragment();
            fragment.appendChild(document.createElement("div"));
            fragment.childNodes[0].innerHTML = contentHTML;

            self.content.blocks = self.blockTools.fragmentToBlocks(fragment.childNodes[0]);

            self.renderContent();
        }

        //returns content as HTML
        self.getContent = function() {
            //this looks dumb.
            return self.blockTools.domFragmentToHTML(self.blockTools.blocksToFragment(self.content.blocks));
        }
        options = $.extend(defaults, options);


        init(options);
    }
    global.Editor = Editor;

})(this)