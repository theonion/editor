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
                }
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
        cursor = {
            updateFocus: function() {
                setTimeout(function() {
                    var sel = window.getSelection();
                    if (sel && sel.type != "None" ) {
                        var range = sel.getRangeAt(0);
                        var node = range.commonAncestorContainer.parentNode;
                        $(".editor>div,.editor>p").removeClass("focus");
                        
                        if ($(node).is(".editor>div,.editor>p")) {
                            $(node).addClass("focus");
                        }
                        else {
                            $(node).parents(".editor>div,.editor>p").addClass("focus");
                        }
                        //move the little focus indicator 
                        if ($(".focus").length > 0)
                            $(".focus-cursor").css({top:$(".focus").position().top+5}).show();
                    }
                }, 20)
            }

        },
        sanitize;

        function init(options) {            
            for (var i=0;i<global.EditorModules.length;i++) {
                moduleInstances.push(new global.EditorModules[i](self, options));
            }
            $(options.element)
                .append('<div class="editor-wrapper">\
                            <div class="editor" contenteditable="true" spellcheck="true">\
                                <p></p>\
                            </div>\
                            <div class="document-tools toolbar"></div>\
                            <div class="paragraph-tools toolbar"></div>\
                            <div class="selection-tools toolbar"></div>\
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
                    /* this may be cumbersome. Probably a cleaner way to do this? */
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
                    if (window.getSelection) {
                        var sel = window.getSelection();
                        if (sel.getRangeAt && sel.rangeCount) {
                            var range = sel.getRangeAt(0);
                            range.deleteContents(); 
                            document.execCommand("InsertHTML", false, cleanHTML);
                        }
                    }
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