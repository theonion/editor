define('scribe-plugin-hr',[],function () {
  return function (config) {
    return function (scribe) {

      scribe.on("inline:insert:hr", insert);

      function insert(block, callback) {
        callback(block, {});
      }
    };
  }
});