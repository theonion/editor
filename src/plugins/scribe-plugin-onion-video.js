define('scribe-plugin-onion-video',[],function () {
  return function (config) {
    return function (scribe) {



      //scribe.on("inline:onion-video", showDialog);
      //scribe.on("inline:edit:onion-video", editVideo);
      //scribe.on("inline:insert:onion-video", uploadVideo);


      function uploadVideo(block, callback) {

        var activeElement = callback(options.block, {videoid:"NONE"});
        return instanceOptions.uploadVideo().then(
            function(videoObject){
                setVideoID(videoObject.attrs.id);
            }, function(error){
                onError(error);
            }, function(progress){
                onProgress(progress);
            }
        );

        function onProgress() {
            //update an indicator
        }

        function setVideoID(id) {
            $("iframe", activeElement).attr("src", instanceOptions.videoEmbedUrl + id);
            $(activeElement).attr('data-videoid', id)
        }

        function onError() {
            //show msg, allow user to trigger upload again
        }

        function onCancel() {
            //remove placeholder. Call it a day.
        }

      }

      function editVideo(block, callback) {
          var id = $(block.element).data('videoid');
          window.editVideo(id);
      }
    };
  }
});