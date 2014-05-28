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

        function showDialog(options) {
          var url = prompt("Youtube URL:", $("A", options.element).attr("href"));
          var youtube_id  = parseYoutube(url);
          if (youtube_id) {
            options.onSuccess(
              options.element,
              {
                "youtube_id": youtube_id, 
                "caption": $(".caption", options.element).html()
              }
            );
          }
        }
      };
    }
});