/* 
    The editor is designed in a way where adding new types of objects to place inline
    is easy.

    Templates and settings are defined via JSON. See inline.json. 

    
    This file contains some modules that implement a few custom inline objects.

 */

(function(global) {
    'use strict';
    var InlineObjectHandlers = InlineObjectHandlers || function(editor, options) {
        var self = this;
        
        editor.blocks.inlineObjectParsers["onion-image"] = function(node) {
            //grab caption & source
            console.log(node);
            return {
                caption: $(".caption", node).html()
            }
        }
        editor.blocks.inlineObjectRenderers["bc-image"] = function(block) {
            return {url: editor.utils.template(IMAGE_URL, block.content)};
        }


        editor.blocks.inlineObjectParsers["image"] = function(node) {
            //grab caption & source
            console.log(node);
            return {
                type:"bc-image",
                caption: $(".caption", node).html()
            }
        }

        editor.blocks.inlineObjectParsers["youtube"] = function(node) {
            return {
                caption: $(".caption", node).html()
            }
        }
        editor.blocks.inlineObjectParsers["embed"] = function(node)  {
            return {
                caption: $(".caption", node).html(),
                body: $(">div", node).html().trim()
            }
        }

        editor.blocks.inlineObjectParsers["onion-video"] = function(node)  {
            return {
                caption: $(".caption", node).html()
            }
        }


        


    }
    global.EditorModules.push(InlineObjectHandlers);
})(this);