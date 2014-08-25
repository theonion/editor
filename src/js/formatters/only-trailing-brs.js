define(function () {

  'use strict';

  // For single-line mode: Firefox needs a BR at the end to work.
  // However, we don't want multiple BRs since this is a single-line input.
  // So I'm whitelisting BR in the "sanitizer" plugin and adding this guy.
  // This will mess up "inline" objects which rely on BR, of which we
  // currently have none so it's not a big deal.
  return function () {
    return function (scribe) {
      scribe.registerHTMLFormatter('normalize', function (html) {
        return html.replace(/<br>(.)/g, ' $1');
      });
    };
  };

});
