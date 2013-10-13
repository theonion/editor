/* 
    provides a generic way to move around "inline objects" within the markup
*/

(function(global) {
    'use strict';
    var InlineObjects = InlineObjects || function(editor, options) {
        var self = this;

        editor.on('init', init);

        editor.on("toolbar:click", function(name){
            if (typeof actions[name] === "function") {
                actions[name]();
            }
        });

        var activeElement;
        function init() {
            //register dialog events:
            $(".editor", options.element).mouseover( function(e) {
                //check to see if the target is inside of an inline element
                var parents = $(e.target).parents('.inline');
                if (parents.length == 1) {
                    //let's position tools over the inline element
                    activeElement = parents[parents.length-1];
                    showToolbar()
                }
                else {
                    hideToolbar();
                }
            });
            $(".inline-tools", options.element).mouseleave(hideToolbar)
        }

        function hideToolbar() {
                $(".inline-tools").hide();
                $(options.element).removeClass("inline-active")
        }

        function showToolbar() {
            var el = $(activeElement);
            var pos = el.position();
            $(options.element).addClass("inline-active")

            $(".inline-tools", options.element)
                .css({
                    top: pos.top + parseInt(el.css('margin-top')), 
                    left: pos.left + parseInt(el.css('margin-left')),
                    width: el.width(),
                    height: el.height()
                })
                .show();
        }

        //TODO: Determine how to handle two adjacent inline elements. Probably skip over?
        var actions = {
            inline_up: function() {
                var previousBlock = $(activeElement).prev()[0];
                if (previousBlock) {
                    var top = $(activeElement).offset().top;
                    $(activeElement).after(previousBlock);
                    
                    showToolbar()

                    var newTop = $(activeElement).offset().top;
                    window.scrollBy(0, newTop - top)
                }
            },
            inline_down: function() {
                var nextBlock = $(activeElement).next()[0];
                if (nextBlock) {
                    var top = $(activeElement).offset().top;
                    $(activeElement).before(nextBlock)
                    showToolbar()
                    var newTop = $(activeElement).offset().top;
                    window.scrollBy(0, newTop - top)
                }
            },
            inline_remove: function () {
                $(activeElement).remove();
                hideToolbar();
            },
            inline_edit: function () {
                // need a way to determine type & call properly fire the right edit event.
                alert("Edit\n\n" + $(activeElement)[0].outerHTML);
                editor.emit("inline:edit:" + type)
            }
        }
        
    }
    global.EditorModules.push(InlineObjects);
})(this)