define('scribe-plugin-onion-video',[],function () {
  return function (config) {
    return function (scribe) {



      scribe.on("inline:edit:onion-video", edit);
      scribe.on("inline:insert:onion-video", insert);


      function insert(callback) {
        
        //TODO: Show some kind of use status while waiting for the initial response.

        return config.insertDialog().then(
            function(videoObject){
              scribe.updateContents(function() {
                callback({embed_url: config.videoEmbedUrl, video_id:videoObject.attrs.id});
              });
            }, function(error){
                onError(error);
            }, function(progress){
                onProgress(progress);
            }
        );

        function onProgress() {
            //update an indicator
        }


        function onError() {
            //show msg, allow user to trigger upload again
        }

        function onCancel() {
            //remove placeholder. Call it a day.
        }

      }

      function edit(block, callback) {
          var id = $(block).attr('data-video-id') || $(block).attr('data-videoid');
          config.editDialog(id);
      }
    };
  }
});