define(function () {

  'use strict';

  return function () {
    return function (scribe) {
      scribe.registerHTMLFormatter('normalize', function (html) {
        return html.replace(/\n/g, ' ');
      });
    };
  };

});
