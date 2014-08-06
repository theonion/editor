define('scribe-plugin-embed',[],function () {
  return function (config) {
    return function (scribe) {
      scribe.on("inline:insert:embed", insert);
      scribe.on("inline:edit:embed", edit);
      var editorEl = scribe.el.parentNode;
      var $modal = $(".embed-modal", editorEl);

      var $bodyInput = $(".embed-body", $modal),
          $captionInput = $(".embed-caption", $modal),
          $embedBtn = $(".set-embed-button", $modal),
          $error = $(".embed-error", $modal),
          $sizeInput = $("[name=size]", $modal);

      $modal.on("hide.bs.modal", function() {
        $embedBtn.unbind("click");
        $error.hide();
      });


      function edit(block, callback) {
        //populate modal contents

        $bodyInput.val(unescape($(block).attr("data-code")));
        $captionInput.val($(".caption", block).text());

        var sizeCropPair = $(block).attr("data-size") + "-" + $(block).attr("data-crop");
        $("[value=" + sizeCropPair + "]", $modal).attr("checked", true);
        $modal.modal("show");
        $embedBtn.click(function () {
          var embedBody = $bodyInput.val();
          if (embedBody.trim() === "") {
             $error.show();
          }
          else {
            $error.hide();
            callback(block, {
              code: embedBody,
              caption: $captionInput.val(),
              escaped_code: escape(embedBody),
              size: getSize(),
              crop: getCrop()
            });
            $modal.modal("hide");

          }
        });
        $modal.modal("show");
      }

      function insert(callback) {
        $bodyInput.val("");
        $captionInput.val("");
        $modal.modal("show");

        $embedBtn.click(function () {
          var embedBody = $bodyInput.val();

          if (embedBody.trim() === "") {
             $error.show();
          }
          else {
            $error.hide();
            callback({
              code: embedBody,
              caption: $captionInput.val(),
              escaped_code: escape(embedBody),
              size: getSize(),
              crop: getCrop()
            });
            $modal.modal("hide");
          }
        });
      }

      function getSize() {
        var value = 'original';
        if ($sizeInput.length > 0) {
          $sizeInput.val().split("-")[0]; 
        }
        return value;
      }

      function getCrop() {
        var value = 'original';
        if ($sizeInput.length > 0) {
          $sizeInput.val().split("-")[1]; 
        }
        return value;
      }

    };
  }
});