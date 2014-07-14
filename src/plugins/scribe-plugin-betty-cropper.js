define('scribe-plugin-betty-cropper',[],function () {
  return function (config) {
    return function (scribe) {

        scribe.on("inline:edit:image", edit);
        scribe.on("inline:insert:image", insert);

        function insert(block, callback) {
          config.insertDialog().then(
            function(success){
              var format;
              if (success.name.toUpperCase().indexOf("GIF") !== -1) {
                format = "gif";
              }
              else {
                format = "jpg";
              }
              callback(block, {image_id: success.id, format: format});
              if (window.picturefill) {
                window.picturefill();
              }
            },
            function(error){
              console.log(error);
            },
            function(progress){
              console.log(progress);
            }
          );
        }

        var activeElement,
          current_id;

        function edit(block, callback) {
          current_id = options.element.getAttribute('data-image-id');
          config.editDialog({id: current_id, caption: '', alt: ''}).then(
            function (image) {

              if (image.id === null) {
                $(block).remove();
              } else {
                $(block).attr('data-image-id', image.id);
                $(block).attr('data-alt', image.alt);
                $(".caption", block).html(image.caption);
              }
              if (window.picturefill) {
                window.picturefill();
              }
            }
          );

        }
      };
    }
}); 