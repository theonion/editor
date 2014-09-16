define(['scribe-common/src/element'], function (scribeElement) {

  'use strict';

  return function () {
    return function (scribe) {

      function traverse(parentNode) {
        var node = parentNode.firstElementChild;

        while (node) {
          if (node.nodeName === 'A' && node.hasAttribute('style')) {
            node.removeAttribute('style');
          }
          else if (node.children.length > 0) {
            traverse(node);
          }
          node = node.nextElementSibling;
        }
      }

      scribe.registerHTMLFormatter('sanitize', function (html) {

        var bin = document.createElement('div');
        bin.innerHTML = html;

        traverse(bin);
        return bin.innerHTML;
      });
    };
  };

});
