(function(global) {
    'use strict';
    var Embed = Embed || function(editor, options) {
        var self = this;

        var currentType;
        function init() {
            $("#embed-panel-close").click(function() { $("#embed-panel").removeClass("open") })
            $("#embed-panel").click(handlePanelClick);
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
                currentType = type;
                $("#embed-panel-contents")
                    .html($("#embed-panel-" + type).html());

                $("#embed-panel")
                    .addClass("open");
            }
        })


        editor.on("toolbar:hover", function(position) {
            if (["left", "right", "full", "center"].indexOf(position) !== -1) {

                var id = $("#image_id").val();
                var dict = {
                    id: id,
                    url: editor.utils.template(editor.embed.types.url, {id: id, crop})

                }
                previeItem("")

            }
        })
        
        editor.embed = {};

        //let's hardcode some types here for now. break into files later
        editor.embed.types = {
            

            /* 
            Image Service stuff:
            curl --form "image=@selig.jpg" http://localhost:8888/api/new

            */ 
            image: {

                url: "http://localhost:8888/{{id}}/{{crop}}/{{width}}.jpg",

                embedMarkup: '<div class="inline image {{position}} placeholder">\
                    <img src="{{url}}">\
                    <span class="caption">An image caption</span>\
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