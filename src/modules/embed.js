(function(global) {
    'use strict';
    var Embed = Embed || function(editor, options) {
        var self = this;


        function init() {

            $("#embed-panel-close").click(function() { $("#embed-panel").removeClass("open") })
        }

        init();

        function previewItem(type) {
            var node = editor.selection.getRootParent();
            var item = editor.embed.types[type];
            if (node) {
                $(node).before(item.placeholder);
            }
        }

        function placeItem(type) {
            //try to use INSERTHML so undo works
            $(".placeholder", editor.element).removeClass("placeholder");
        }


        editor.on("toolbar:click", function(type) {
            if (typeof editor.embed.types[type] === "object" ) {
                //TODO: manage templates better
                $("#embed-panel-contents")
                    .html($("#embed-panel-" + type).html());

                $("#embed-panel")
                    .addClass("open");
                

            }
        })
        
        editor.embed = {};

        //let's hardcode some types here for now. break into files later
        editor.embed.types = {
            
            image: {
                edit: function() {
                    //this happens when you edit.
                },
                placeholder: '<div class="inline image left placeholder">\
                    <img src="http://placehold.it/400x300/C0392B/F39C12">\
                    <span class="caption">A delightful image</span>\
                    </div>'
            },
            video: {
                edit: function() {
                    //this happens when you edit.
                },
                placeholder: '<div class="inline right video placeholder">\
                    <img src="http://placehold.it/240x135/27AE60/ffffff">\
                    <span class="caption">An enjoyable video</span>\
                    </div>'
            },

            audio: {
                edit: function () {}

            },
            tweet: {
                edit: function () {}

            },
            specialchars: {
                edit: function () {}

            },
            html: {
                edit: function () {}

            }

        }
    }
    global.EditorModules.push(Embed);
})(this)