define([
    'scribe-common/src/element'
  ], function (
    element
  ) {

  /**
   * For when you don't want BRs in your elements.
   */

  'use strict';

  function isInlineElement(node) {
    return !element.isBlockElement(node);
  }

  function isEmpty(node) {
    return node.children.length === 0
      || (node.children.length === 1
          && element.isSelectionMarkerNode(node.children[0]));
  }

  function traverse(parentNode) {
    var parentIsInline = isInlineElement(parentNode);
    var node = parentNode.firstElementChild;
    while (node) {
      var nextNode = node.nextElementSibling;
      if (node.tagName == 'BR' && parentIsInline) {
        parentNode.removeChild(node);
      } else if (node.children.length > 0) {
        traverse(node);
      }
      node = nextNode;
    }
  }

  return function () {
    return function (scribe) {

      scribe.registerHTMLFormatter('sanitize', function (html) {
        var bin = document.createElement('div');
        bin.innerHTML = html;

        traverse(bin);

        return bin.innerHTML;
      });

    };
  };

});
