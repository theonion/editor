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
          $error = $(".embed-error", $modal);




      $modal.on("hide.bs.modal", function() {
        $embedBtn.unbind("click");
        $error.hide();
      });


      function edit(block, callback) {
        //populate modal contents

        $bodyInput.val(unescape($(block).attr("data-code")));
        $captionInput.val($(".caption", block).text());

        $modal.modal("show");
        $embedBtn.click(function () {
          var embed_body = $bodyInput.val();
          if (embed_body.trim() === "") {
             $error.show();
          }
          else {
            $error.hide();
            callback(block,
              {code: embed_body,
              caption: $captionInput.val(),
              escaped_code: escape(embed_body)
            })
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
          var embed_body = $bodyInput.val();

          if (embed_body.trim() === "") {
             $error.show();
          }
          else {
            $error.hide();
            callback(
              {code: embed_body,
              caption: $captionInput.val(),
              escaped_code: escape(embed_body)
            })
            $modal.modal("hide");
          }
        });
      }
    };
  }
});