(function(global) {
    'use strict';
    var Embed = Embed || function(editor, options) {
        var self = this;
        var embedMarkup = 
            '<div class="inline left video" data-youtube="{{youtube_id}}" data-title="{{caption}}">\
                <img src="http://i1.ytimg.com/vi/{{youtube_id}}/mqdefault.jpg">\
                <span class="caption">{{caption}}</span>\
            </div>'
 


        editor.on("toolbar:click", function(type) {
            if (type === "youtube" ) {


                console.log("Youtube");
                          
            }
        })



        //

        editor.embed = {types: []};
    }
    global.EditorModules.push(Embed);
})(this)