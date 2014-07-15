define('scribe-plugin-placeholder',[],function () {

  return function (config) {
    return function (scribe) {
      scribe.on('content-changed', checkForEmpty);
      config.container.innerHTML = config.text;
      function checkForEmpty() {
        var content = scribe.getContent()
        if (content === "<p><br></p>") {
          config.container.style.display = '';
        }
        else {
          config.container.style.display = 'none';
        }
      }
    }
  }
});