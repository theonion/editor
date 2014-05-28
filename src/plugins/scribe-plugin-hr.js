define('scribe-plugin-hr',[],function () {
  return function (config) {
    return function (scribe) {
      scribe.on("inline:hr", showDialog);
      function showDialog(options) {
        options.onSuccess(options.block, {});
      }
    };
  }
});