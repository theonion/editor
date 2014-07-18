define('scribe-plugin-embed',[],function () {
  return function (config) {
    return function (scribe) {
      scribe.on("inline:insert:embed", insert);
      scribe.on("inline:edit:embed", edit);

      $("#embed-modal").on("hide.bs.modal", function() {
        $("#set-embed-button").unbind("click");
        $(".embed-error").hide();
      });


      function edit(block, callback) {
        //populate modal contents

        $("#embed-modal .embed-body").val(unescape($(block).attr("data-code")));
        $("#embed-modal .embed-source").val($(block).attr("data-source"));
        $("#embed-modal .embed-caption").val($(".caption", block).text());


        $("#embed-modal").modal("show");
        $("#set-embed-button").click(function () {
          var embed_body = $("#embed-modal .embed-body").val();
          if (embed_body.trim() === "") {
             $(".embed-error").show();
          }
          else {
            $(".embed-error").hide();
            callback(block,
              {body: embed_body,
              caption: $("#embed-modal .embed-caption").val(),
              source: $("#embed-modal .embed-source").val(),
              escapedbody: escape(embed_body)
            })
            $("#embed-modal").modal("hide");

          }
        });
        $("#embed-modal").modal("show");
      }

      function insert(callback) {
        $("#embed-modal input, #embed-modal textarea").val("")
        $("#embed-modal").modal("show");

        $("#set-embed-button").click(function () {
          var embed_body = $("#embed-modal .embed-body").val();

          if (embed_body.trim() === "") {
             $(".embed-error").show();
          }
          else {
            $(".embed-error").hide();
            callback(
              {code: embed_body,
              caption: $("#embed-modal .embed-caption").val(),
              source: $("#embed-modal .embed-source").val(),
              escaped_code: escape(embed_body)
            })
            $("#embed-modal").modal("hide");
          }
        });
      }
    };
  }
});