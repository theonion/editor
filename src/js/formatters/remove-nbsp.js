define(function () {

  /**
   * Chrome:
   */

  'use strict';

  return function () {
    return function (scribe) {
      var nbspCharRegExp = /(&nbsp;)+/g;

      // TODO: should we be doing this on paste?
      scribe.registerHTMLFormatter('normalize', function (html) {
        return html.replace(nbspCharRegExp, ' ');
      });
    };
  };

});