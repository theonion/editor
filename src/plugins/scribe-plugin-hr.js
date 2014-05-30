define('scribe-plugin-hr',[],function () {
  return function (config) {
    return function (scribe) {

      scribe.on("inline:hr", insert);

      function insert(block, callback) {
        callback(block, {});
      }
    };
  }
});