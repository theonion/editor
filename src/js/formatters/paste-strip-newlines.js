define(function () {

  'use strict';

  return function () {
    return function (scribe) {
      scribe.registerHTMLFormatter('paste', function (html) {
        return html.replace(/\n/g, ' ');
      });
    };
  };

});
