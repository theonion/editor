define(['scribe-common/src/element'], function (scribeElement) {

  'use strict';

  return function () {
    return function (scribe) {

      function traverse(parentNode) {
        var node = parentNode.firstElementChild;
        
        while (node) {
          var nextNode = node.nextElementSibling;

          if (node.children.length > 0) {
            traverse(node);
          }

          if (node.hasAttribute('style')) {
            node.removeAttribute('style');
          }

          // There seem to be a bunch of empty p tags, that cause all kinds of trouble.
          if (node.nodeName === 'P' && node.textContent.trim() === '') {
            parentNode.removeChild(node); // Kill these empty p tagz
          }

          // FUCK YO SPANS
          if (node.nodeName === 'SPAN') {
            scribeElement.unwrap(parentNode, node);
          }

          node = nextNode;
        }
      }

      scribe.registerHTMLFormatter('paste', function (html) {

        var bin = document.createElement('div');
        bin.innerHTML = html;

        var childNodes = [].slice.call(bin.childNodes);
        childNodes.forEach(function(childNode) {
          if (childNode.nodeType === 3 && childNode.textContent.trim() === '') {
            // Kill all empty spaces between tags.
            bin.removeChild(childNode);
          }
        });

        traverse(bin);
        return bin.innerHTML;
      });
    };
  };

});
