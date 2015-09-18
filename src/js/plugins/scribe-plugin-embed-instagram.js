define('scribe-plugin-embed-instagram', [], function () {

  return function (config) {
    return function (scribe) {
      var $modal = $(scribe.el.parentNode).find('.embed-modal');
      var $modalCaption = $modal.find('.embed-caption');
      var $modalError = $modal.find('.embed-error');
      var $modalInput = $modal.find('.embed-body');
      var $modalOk = $modal.find('.set-embed-button');

      $modal.on('hide.bs.modal', function () {
        $modalOk.off('click');
        $modalError.hide();
      });

      var insert = function (callback) {
        $modalInput.val('');
        $modalCaption.val('');

        $modalOk.on('click', function () {
          var html = $modalInput.val();

          if (!html.trim()) {
            $modalError.show();
          } else {
            $modalError.hide();

            callback({
              html: escape(html),
              caption: $modalCaption.val()
            });

            $modal.modal('hide');
          }
        });
        $modal.modal('show');
      };

      var edit = function (block, callback) {
        var $block = $(block);
        var $embedContainer = $block.children('.embed-container');
        var processor = $embedContainer
            .instagramEmbedProcessor()
            .data('pluginInstagramEmbedProcessor');

        $modalInput.val(processor.html());
        $modalCaption.val($block.children('.caption').text());

        $modalOk.on('click', function () {
          var html = $modalInput.val();

          if (!html.trim()) {
            $modalError.show();
          } else {
            $modalError.hide();

            callback(block, {
              html: escape(html),
              caption: $modalCaption.val()
            });

            $modal.modal('hide');
          }
        });
        $modal.modal('show');
      };

      var after = function ($inserted) {
        var $embedContainer = $inserted.find('.embed-container');
        var processor = $embedContainer
            .instagramEmbedProcessor()
            .data('pluginInstagramEmbedProcessor');
        processor.prep();
      };

      scribe.on('inline:insert:embed-instagram', insert);
      scribe.on('inline:insert:embed-instagram:done', after);
      scribe.on('inline:edit:embed-instagram', edit);
      scribe.on('inline:edit:embed-instagram:done', after);
    };
  };
});
