define('scribe-plugin-youtube',[],function () {

  return function (config) {
    return function (scribe) {

        scribe.on("inline:youtube", showDialog);

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

        function showDialog(block, callback) {
          var url = prompt("Youtube URL:", $("A", block).attr("href"));
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