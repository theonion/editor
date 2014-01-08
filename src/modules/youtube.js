(function(global) {
    'use strict';
    var Youtube = Youtube || function(editor, options) {
        var self = this;

        var YOUTUBE_BASE_URL = "http://www.youtube.com/watch?v=";


        editor.on("inline:insert:youtube", insert);
        editor.on("inline:edit:youtube", edit);

        function insert(opts) {
            var url = prompt("Youtube URL:")
            var youtube_id  = parseYoutube(url);
            if (youtube_id) {
                opts.onSuccess(
                    opts.block, 
                    {"youtube_id": youtube_id}
                );
            }
            else {
            }
        }

        function edit(opts) {
            console.log("EDIT");
            var url = prompt("Youtube URL:", $("A", opts.element).attr("href"));
            var youtube_id  = parseYoutube(url);
            if (youtube_id) {
                opts.onChange(
                    opts.element,
                    
                    {
                        "youtube_id": youtube_id, 
                        "caption": $(".caption", opts.element).html()
                    }
                );
            }   
            else {
            }
        }
        function parseYoutube(url){
            var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
            var match = url.match(regExp);
            if (match && match[7].length == 11) {
                return match[7];
            }
            else {
                return false;
            }
        }
    }
    global.EditorModules.push(Youtube);
})(this)