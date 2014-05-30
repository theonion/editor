define('scribe-plugin-onion-video',[],function () {
  return function (config) {
    return function (scribe) {
      scribe.on("inline:onion-video", showDialog);
      function showDialog(block, callback) {
        callback(block, {video_id: 0, caption: ""});
      }
    };
  }
});