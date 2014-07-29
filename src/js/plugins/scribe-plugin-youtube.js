define('scribe-plugin-youtube',[],function () {

  return function (config) {
    return function (scribe) {

        scribe.on("inline:insert:youtube", insert);
        scribe.on("inline:edit:youtube", edit);

        function parseYoutube(url){
          if (!url) return false;
          var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
          var match = url.match(regExp);
          if (match && match[7].length == 11) {
            return match[7];
          }
          else {
            return false;
          }
        }

        function insert(callback) {
          var url = prompt("Youtube URL:");
          var youtube_id  = parseYoutube(url);
          if (youtube_id) {
            callback(
              {
                "youtube_id": youtube_id, 
                "caption": ""
              }
            );
          }
        }
        
        function edit(block, callback) {
          var url = prompt("Youtube URL:", $(block).attr("data-youtube-id") || "");
          var youtube_id  = parseYoutube(url);
          if (youtube_id) {
            callback(
              block,
              {
                "youtube_id": youtube_id, 
                "caption": $(".caption", block).html()
              }
            );
          }
        }
      };
    }
});