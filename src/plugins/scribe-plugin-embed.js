define('scribe-plugin-embed',[],function () {
  return function (config) {
    return function (scribe) {
      scribe.on("inline:embed", showDialog);
      function showDialog(options) {
        options.onSuccess(options.block, {html: "", caption: ""});
      }
    };
  }
});