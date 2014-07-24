define('scribe-plugin-onion-video',[],function () {
  return function (config) {
    return function (scribe) {



      scribe.on("inline:edit:onion-video", edit);
      scribe.on("inline:insert:onion-video", insert);


      function insert(callback) {

        var activeElement = callback({video_id:"NONE"});
        console.log("active video element", activeElement);
        return config.insertDialog().then(
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
          scribe.updateContent(function() {
            $("iframe", activeElement).attr("src", config.videoEmbedUrl + id);
            $(activeElement).attr('data-video-id', id)
          });
        }

        function onError() {
            //show msg, allow user to trigger upload again
        }

        function onCancel() {
            //remove placeholder. Call it a day.
        }

      }

      function edit(block, callback) {
          var id = $(block).attr('data-video-id');
          config.editDialog(id);
      }
    };
  }
});