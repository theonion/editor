'use strict';
define([],function () {
  return function (config) {
    return function (scribe) {

        function insert(callback) {
          config.insertDialog().then(
            function(success){
              var format;
              if (success.name.toUpperCase().indexOf('GIF') !== -1) {
                format = 'gif';
              }
              else {
                format = 'jpg';
              }
              callback({image_id: success.id, format: format});
              if (window.picturefill) {
                setTimeout(function() {
                  // this could be nicer...
                  window.picturefill($('[data-image-id=' + success.id + ']')[0]);
                }, 100);
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

        var current_id;

        function edit(block, callback) {
          current_id = block.getAttribute('data-image-id');
          var caption = $('.caption', block).html();
          var alt = block.getAttribute('data-alt');
          config.editDialog({id: current_id, caption: caption, alt: alt}).then(
            function (image) {

              if (image.id === null) {
                $(block).remove();
              } else {
                $(block).attr('data-image-id', image.id);
                $(block).attr('data-alt', image.alt);
                $('.caption', block).html(image.caption);
                if (window.picturefill) {
                  setTimeout(function() {
                    window.picturefill($('[data-image-id=' + image.id + ']')[0]);
                  }, 100);
                }
              }
            }
          );
        }

        scribe.on('inline:edit:image', edit);
        scribe.on('inline:insert:image', insert);
      };
    };
});