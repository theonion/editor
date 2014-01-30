/* 
    provides a generic way to move around "inline objects" within the markup

    z
*/

(function(global) {
    'use strict';
    var InlineObjects = InlineObjects || function(editor, options) {
        var self = this;
            

        editor.on('init', init);

        editor.on("toolbar:click", function(name){
            //is it a registered action below?
            if (typeof actions[name] === "function") {
                actions[name]();
            }

            //is there an inline type defined
            else if (inline.hasOwnProperty(name)) {
                editor.killFocus();
                editor.emit("inline:insert:" + name, 
                    {
                        block: activeBlock, 
                        insertInlineItem: function(block, values) {
                            $(block).before(
                                editor.utils.template(
                                    options.inline[name].template,
                                    $.extend(options.inline[name].defaults, values) 
                                )
                            );
                            $(".inline").attr("contentEditable", "false");
                        },
                        onError: function() {
                            //do nothing!
                        }
                    }
                );
                $(".embed-tools", options.element).removeClass("active");
                activeBlock = undefined;
            }
        });

        
        var activeElement;
        var activeBlock;

        function init() {
            //Inline overlay events
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

            /* Events for inline insert */
            $(".editor", options.element).mousemove( function(e) {
                if ($(e.target).hasClass("editor")) {
                    var cursorOffset = e.clientY + window.scrollY;
                    // probably inefficient, but may not matter
                    var blocks = $(".editor>*", options.element)
                    for (var i =0; i < blocks.length; i++) {
                        if (cursorOffset < $(blocks[i]).offset().top + 40  ) {
                            break;
                        }
                    }
                    if (blocks[i]) {
                        var top = $(blocks[i]).position().top;
                        $(".embed-tools", options.element)
                            .css({ top: top - 35  })
                            .addClass("active");
                        activeBlock = blocks[i];
                    }
                }
                else {
                    $(".embed-tools", options.element).removeClass("active");
                    activeBlock = undefined;
                }

            });
            $(options.element).mouseleave(function() {
                $(".embed-tools", options.element).removeClass("active");
                activeBlock = undefined;
            });
            $(".inline-tools", options.element).mouseleave(hideToolbar);
        }


        function hideToolbar() {
            $(".inline-tools").hide();
            $(options.element).removeClass("inline-active")
        }

        function showToolbar() {
            var el = $(activeElement);
            var pos = el.position();
            $(options.element).addClass("inline-active");
            
            //set size
            $(".inline-tools .size", options.element)
                .html($(activeElement).attr("data-size"));

            //set crop
            $(".inline-tools .crop", options.element)
                .html($(activeElement).attr("data-crop"));

            $(".inline-tools", options.element)
                .css({
                    top: pos.top + parseInt(el.css('margin-top')), 
                    left: pos.left + parseInt(el.css('margin-left')) + parseInt($(".editor", options.element).css('margin-left')),
                    width: el.width(),
                    height: el.height()
                })
                .show();
        }


        var actions = {

            inline_caption: function() {
                var caption = prompt("Caption", 
                    $(".caption", activeElement).html()
                );
                if (caption) {
                    $(".caption", activeElement).html(caption);
                }
            },
            inline_size: function() {
                var l = options.inline[$(activeElement).data("type")].size;
                toggleAttribute("size", l);
            },
            inline_crop: function() {
                var l = options.inline[$(activeElement).data("type")].crop;
                toggleAttribute("crop", l);
            },
            inline_up: function() {
                var previousBlock = $(activeElement).prev()[0];
                if (previousBlock) {
                    var top = $(activeElement).offset().top;
                    $(activeElement).after(previousBlock);
                    showToolbar();
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
                /* I think this should be a bit more like insert.
                We establish an onChange callback where we update the template with new values. 
                For now, the module is responsible for making modifications to the markup. 

                */
                editor.emit("inline:edit:" + $(activeElement).attr("data-type"), 
                    {
                        element: activeElement,
                        onChange: function(element, values) {
                            var type = $(element).attr("data-type");
                            element.outerHTML = 
                                editor.utils.template(
                                    //TODO:
                                    options.inline[type].template,
                                    $.extend(options.inline[name].defaults, values) 
                                )
                        }
                    }
                )
            }
        }

        function toggleAttribute(attribute, list) {
            var currentValue = $(activeElement).attr("data-" + attribute);
            var index = list.indexOf(currentValue) + 1;
            if (index >= list.length)
                index = 0;
            $(activeElement)
                .removeClass(attribute + "-" + currentValue)
                .addClass(attribute + "-" + list[index])
                .attr("data-" + attribute, list[index])
            showToolbar();
        } 
    }
    global.EditorModules.push(InlineObjects);
})(this);