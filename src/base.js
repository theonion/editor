(function(global){
    'use strict';
    global.EditorInstances = global.EditorInstances || [];
    global.EditorModules = []; //a place to keep track of modules

    var Editor = Editor || function(options) {
        var self = this,
        defaults = {
                element: null, /* element to make Editable */
                content: "<p><br></p>",
                allowNewline: true,
                sanitize: {
                  elements: ['b', 'em', 'i', 'strong', 'u', 'p','blockquote','a', 'ul', 'ol', 'li','br', 'sub', 'sup', 's'],
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
            },
            fixQuotes: function(str) {
              str = str.replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018");       // opening singles
              str = str.replace(/'/g, "\u2019");                            // closing singles & apostrophes
              str = str.replace(/(^|[-\u2014/\[(\u2018\s])"/g, "$1\u201c"); // opening doubles
              str = str.replace(/"/g, "\u201d");                            // closing doubles
              return str;
            }
        },
        sanitize,
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
            sanitize = new Sanitize(options.sanitize);


            self.setContent(options.content);

            self.content = options.content;

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

                    var node = self.selection.getNonInlineParent();

                    var previousChildNode = $(node).prev()[0];

                    var parentNode = node.parentNode || node;
                    var isParentRoot = $( parentNode).hasClass("editor");
                    var isBlank = ($(node).text() === "");
                    var isPreviousChildBlank = ($(previousChildNode).text() === "");
                    var isFirstChild = (typeof previousChildNode === "undefined");
                    var isLastChild = (typeof $(node).next()[0] === "undefined");
                    var isTextSelected = self.selection.hasSelection();
                    // handle enter key shit.
                    if (e.keyCode === 13) {
                        if (isTextSelected || !options.allowNewline) {
                            // shit gets weird when enter is pushed and text is selected. Nobody does this
                            e.preventDefault();
                        }
                        else if (isBlank  && !e.shiftKey) { //enter was hit in an empty node.

                            if (parentNode.tagName === "BLOCKQUOTE") {
                                if (isLastChild && isFirstChild) {

                                }
                                else if (isLastChild) {
                                   // LI: At end of list
                                    e.preventDefault();
                                    self.selection.insertParagraphAfter(parentNode);
                                    $(node).remove();
                                    self.selection.selectNode(parentNode);
                                }

                            }

                            else if (node.tagName === "P") { //go nuts with paragraphs, but not elsewhere

                            }
                            //Redo this block exclusively using dom manip, not
                            else if (node.tagName == "LI") {
                                if (isLastChild && isFirstChild) {
                                    e.preventDefault();
                                    $(node).remove(); // remove the li
                                    document.execCommand("formatBlock", false, "P");
                                    setTimeout(function() {
                                        var nodeToRemove = self.selection.getNonInlineParent()
                                        $(nodeToRemove).remove();
                                    }, 5)

                                }
                                else if (isFirstChild) {
                                    e.preventDefault();
                                }
                                else if (isLastChild) {
                                    // LI: At end of list
                                    e.preventDefault();
                                    self.selection.insertParagraphAfter(parentNode);
                                    $(node).remove();
                                }
                                else if (!isLastChild && !isFirstChild) {
                                    //LI: In the middle of the list
                                    //e.preventDefault();
                                    setTimeout(function() {
                                        $(".editor div").remove();
                                        //this sucks, but it kind of works.
                                        document.execCommand("insertHtml", false, "<p><br></p>")
                                    })
                                }
                            }
                        }

                        else if (["H1", "H2", "H3", "H4", "H5", "H6"].indexOf(node.tagName) > 0) {
                            //is the cursor at the end? If so insert a new paragraph at the end.

                            // Is the anchor node the last child of the node?
                            var s = rangy.getSelection();
                            // cursor is in the last child node of the header...
                            if (self.selection.lastTextNode(node) === s.anchorNode) {
                                // cursor is at the very end of the anchor node
                                if (s.anchorOffset === s.anchorNode.nodeValue.length) {
                                    var blockNode = self.selection.getNonInlineParent(node);
                                    self.selection.insertParagraphAfter(blockNode);
                                    e.preventDefault();
                                    return;
                                }
                            }
                        }
                    }
                    else if (e.keyCode === 8) {
                        self.emit("backspace");
                        var sel = window.getSelection()
                        //this happens when the cursor is in the last remaining empty paragraph.
                        if (sel.focusNode.tagName === "P" && $(".editor>P").length == 1) {
                            e.preventDefault();
                        }

                        //is the previous element an inline element
                        if ($(previousChildNode).hasClass("inline")) {
                            //is the cursor in the first position of the current node.
                            var sel = self.selection.getSelection()

                            if (sel.anchorOffset === 0 && sel.isCollapsed) {
                                e.preventDefault();
                            }
                        }

                    }
                    setTimeout(isEmptyCheck, 50);

                    self.emit("keydown", e);
                })
                .bind("keyup", function(e) {
                    self.emit("keyup", e);
                })
                .bind("paste", function(e) {

                    //save range info
                    var range = self.serializeRange()

                    /* hack for safari pasting. can't use clipboardData */
                    $("<div>")
                        .attr("contenteditable", "true")
                        .attr("id", "paste-bucket")
                        .css({"position":"fixed", "top":"0px", "z-index":10000, "width":"1px", "height":"1px","overflow":"hidden"})
                        .appendTo("body")
                        .focus();

                    //handle paste, defer to give time to focus & paste
                    setTimeout(function() {
                        var pastedHTML = $("#paste-bucket").html();
                        $("#paste-bucket").remove();


                        pastedHTML = pastedHTML.replace(/\n/g, " ");
                        var fragment = document.createDocumentFragment();
                        fragment.appendChild(document.createElement("div"))
                        fragment.childNodes[0].innerHTML = pastedHTML;

                        var cleanFrag = sanitize.clean_node(fragment.childNodes[0]);

                        window.frag = cleanFrag;


                        //allow something else to make changes to the fragment
                        self.emit("paste", cleanFrag);

                        $(frag)
                            .contents()
                            .filter(function() {
                                console.log(this);
                                return this.nodeType === 3; //Node.TEXT_NODE
                            }).each(function() {
                                console.log(self.utils.fixQuotes(this.textContent));
                                this.textContent = self.utils.fixQuotes(this.textContent);
                            });

                        var htmlString = "";
                        for (var i = 0; i < cleanFrag.childNodes.length; i++) {
                            var node = cleanFrag.childNodes[i];
                            if (node.nodeType === 3) {
                                //pass on text nodes.
                                htmlString += node.nodeValue;
                            }
                            else if (node.nodeType === 1) {
                                if (!cleanFrag.childNodes[i].textContent.replace(/\n/g, "").trim() == "") { // exclude tags with no content
                                    htmlString += cleanFrag.childNodes[i].outerHTML;
                                }
                            }
                        }



                        self.deserializeRange(range);
                        $(".editor", options.element).focus();

                        //TODO: stop using this insertorreplace thing
                        self.selection.insertOrReplace(htmlString);
                        isEmptyCheck();
                    }, 50);

                })
        };

        self.destroy = function() {
            self.emit("destroy");
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


        self.setContent = function(contentHTML) {
            var fragment = document.createDocumentFragment();
            fragment.appendChild(document.createElement("div"))
            fragment.childNodes[0].innerHTML = contentHTML;

            var embeds = $(".embed", fragment.childNodes[0]);
            for (var i = 0; i < embeds.length; i++) {
                $(embeds[i]).attr("data-body", escape($(">div", embeds[i]).html()));
            }

            $(options.element).find(".editor").html(fragment.childNodes[0].innerHTML);

            //check dom for errors. For now, just pull out of div if all content is wrapped with a div.
            var firstDiv = $(".editor>div", options.element);
            if (typeof firstDiv.attr("data-type") === "undefined" && firstDiv.length == 1) {
                $("#content-body .editor").html( $("#content-body .editor>div").html() )
            }

            //add contentEditable false to any inline objects
            $(".inline").attr("contentEditable", "false");

            if (typeof window.picturefill === "function") {
                window.picturefill();
            }
        }

        self.getContent = function() {
            //remove images
            var fragment = document.createDocumentFragment();
            fragment.appendChild(document.createElement("div"))
            fragment.childNodes[0].innerHTML = $(options.element).find(".editor").html();

            $(".image>div>img", fragment.childNodes[0]).remove();
            $(".image", fragment.childNodes[0]).removeClass("new");

            /* hacks that will hang out until the new block architecture is ready */

            //revert embeds back to original state
            var embeds = $(".embed", fragment.childNodes[0]);
            for (var i = 0; i < embeds.length; i++) {
                if ($(embeds[i]).is("[data-body]")) {
                    $(">div", embeds[i]).html(unescape($(embeds[i]).attr("data-body")));
                    //don't save with the data-body attribute set.
                    $(embeds[i]).removeAttr("data-body");
                }
            }
            //clear out spans out of paragraphs
            var spans = $(">p span", fragment.childNodes[0]);
            for (var i = 0; i < spans.length; i++) {
                spans[i].outerHTML = spans[i].innerHTML;
            }
            //remove all other style attributes
            $(">p [style]", fragment.childNodes[0]).removeAttr("style");

            //let's strip out any contentEditable attributes
            $(".inline", fragment.childNodes[0]).removeAttr("contentEditable");

            var html = fragment.childNodes[0].innerHTML;

            //remove nbsp, if not permitted.
            if (options.allowNbsp === false) {
                html = html.replace(/&nbsp;/g, " ").trim();
            }
            return html;
        }

        options = $.extend(defaults, options);
        init(options);
        global.EditorInstances.push(self);
    }
    global.Editor = Editor;
})(this);