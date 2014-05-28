define('scribe-plugin-onion-video',[],function () {
  return function (config) {
    return function (scribe) {
      scribe.on("inline:onion-video", showDialog);
      function showDialog(options) {
        options.onSuccess(options.block, {video_id: 0, caption: ""});
      }
    };
  }
});