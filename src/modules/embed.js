(function(global) {
    'use strict';
    var Embed = Embed || function(editor, options) {
        var self = this;

/*
        function previewItem(type) {
            var node = editor.selection.getRootParent();
            var item = editor.embed.types[type];
            
            if (node) {
                $(node).before( item.placeholder()  );
            }

        }

        function placeItem(type) {
            $(".placeholder", editor.element).removeClass("placeholder");
        }
*/

        editor.on("toolbar:click", function(type) {
            if (editor.embed.types.indexOf(type) !== -1 ) {

                //emit an embed event for third party embed implementations to listen on
                editor.emit("embed:" + type);                
            }
        })

        editor.embed = {types: []};
    }
    global.EditorModules.push(Embed);
})(this)