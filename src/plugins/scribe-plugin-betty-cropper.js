define('scribe-plugin-betty-cropper',[],function () {
  return function (config) {
    return function (scribe) {
        function showDialog(block, callback) {
            console.log("show dialog args", block, callback);
            callback(block, {image_id: 5});
        }
        scribe.on("inline:betty-cropper", showDialog);
      };
    }
}); 