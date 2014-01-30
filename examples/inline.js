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
        

        function parseInlineImage(node) {
            //grab caption & source
            console.log(node);
            return {
                caption: $(".caption", node).html()
            }
        }

        function parseInlineYoutube(node) {
            return {
                caption: $(".caption", node).html()
            }
        }
        function parseInlineEmbed(node) {
            return {
                caption: $(".caption", node).html(),
                body: $(">div", node).html().trim()
            }
        }

        function parseInlineVideo(node) {
            return {
                caption: $(".caption", node).html()
            }
        }
    }
    global.EditorModules.push(InlineObjectHandlers);
})(this);