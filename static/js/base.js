(function(global){

    'use strict';

    global.EditorModules = []; //a place to keep track of modules

    var Editor = Editor || function(options) {
        var self = this,
        defaults = {
                element: null, /* element to make Editable */
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
                    console.log("updateFocus");
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

        }






        function init(options) {            
            for (var i=0;i<global.EditorModules.length;i++) {
                moduleInstances.push(new global.EditorModules[i](self, options));
            }
            $(options.element)
                .append('<div class="editor-wrapper"><div class="editor" contenteditable="true" spellcheck="true"></div>'
                        + '<div class="focus-cursor icon-caret-right"></div></div>')
                
            self.emit("init");


            $(options.element)
                .bind("keyup", function(e) {
                    self.emit("keyup");
                })
                .bind("keyup mousdown", function(e) {
                    cursor.updateFocus();
                    self.emit("keyup-or-mousedown");
                })
        };

        utils.enableEvents(self);


        self.setContent = function(contentHTML) {

        }

        options = _.extend(defaults, options);
        init(options);        

    }
    global.Editor = Editor;

})(this)