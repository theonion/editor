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
        
        editor.blockTools.inlineObjectParsers["onion-image"] = function(node) {
            //grab caption & source
            console.log(node);
            return {
                caption: $(".caption", node).html() || ""
            }
        }
        editor.blockTools.inlineObjectRenderers["bc-image"] = function(block) {
            return {url: editor.utils.template(IMAGE_URL, block.content)};
        }

        editor.blockTools.inlineObjectParsers["image"] = function(node) {
            //grab caption & source
            console.log(node);
            return {
                type:"bc-image",
                caption: $(".caption", node).html() || ""
            }
        }

        editor.blockTools.inlineObjectParsers["youtube"] = function(node) {
            return {
                caption: $(".caption", node).html() || ""
            }
        }
        
        editor.blockTools.inlineObjectParsers["embed"] = function(node)  {
            return {
                caption: $(".caption", node).html() || "",
                body: $(">div", node).html().trim()
            }
        }

        editor.blockTools.inlineObjectParsers["onion-video"] = function(node)  {
            return {
                caption: $(".caption", node).html() || ""
            }
        }

    }
    global.EditorModules.push(InlineObjectHandlers);
})(this);