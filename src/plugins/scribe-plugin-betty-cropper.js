define('scribe-plugin-betty-cropper',[],function () {

  return function (config) {
    return function (scribe) {

        // CONFIG may contain some kind of 
        scribe.on("inline:betty-cropper", showImageOptions);


        function showImageOptions(options) {
            console.log("HEY, betty-cropper PLUGIN CALLED. EVENTS ARE TWERKING", options);
            options.onSuccess(options.block, {image_id: 5});
        }

      };
    }
});