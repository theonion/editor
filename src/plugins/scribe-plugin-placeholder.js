define('scribe-plugin-placeholder',[],function () {

  return function (options) {
    return function (scribe) {
      scribe.on('content-changed', checkForEmpty);
      options.placeholderElement.innerHTML = options.placeholderText;
      function checkForEmpty() {
        var content = scribe.getContent()
        if (content === "<p><br></p>") {
          options.placeholderElement.style.display = '';
        }
        else {
          options.placeholderElement.style.display = 'none';
        }
      }
    }
  }
});