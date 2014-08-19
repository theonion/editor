define(function () {

  'use strict';

  return function () {
    return function (scribe) {
      scribe.registerHTMLFormatter('paste', function (html) {
        return html.replace(/&nbsp;/g, ' ');
      });
      scribe.registerHTMLFormatter('normalize', function (html) {
        return html.replace(/&nbsp;/g, ' ');
      });
    };
  };

});
