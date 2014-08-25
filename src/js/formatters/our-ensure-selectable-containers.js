define([
    'scribe-common/src/element',
    'lodash-amd/modern/collections/contains'
  ], function (
    element,
    contains
  ) {

  /**
   * Chrome and Firefox: All elements need to contain either text or a `<br>` to
   * remain selectable. (Unless they have a width and height explicitly set with
   * CSS(?), as per: http://jsbin.com/gulob/2/edit?html,css,js,output)
   */

  /**
   * It seems we don't want BRs inserted in html-inline elements (like I, B, A) nor
   * our "inline objects" so we allow for an optional "skipElement" function in
   * the config.
   */

  'use strict';

  // http://www.w3.org/TR/html-markup/syntax.html#syntax-elements
  var html5VoidElements = ['AREA', 'BASE', 'BR', 'COL', 'COMMAND', 'EMBED', 'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'];
  var inlineElementNames = ['A', 'B', 'DEL', 'EM', 'STRONG', 'I', 'U'];
  function nodeIsInlineElement(node) {
    return inlineElementNames.indexOf(node.nodeName) !== -1;
  }

  function traverse(parentNode, config) {
    // Instead of TreeWalker, which gets confused when the BR is added to the dom,
    // we recursively traverse the tree to look for an empty node that can have childNodes

    var node = parentNode.firstElementChild;

    function isEmpty(node) {
      return node.children.length === 0
        || (node.children.length === 1
            && element.isSelectionMarkerNode(node.children[0]));
    }

    while (node) {
      if (!element.isSelectionMarkerNode(node)) {
        // Find any node that contains no child *elements*, or just contains
        // whitespace, and is not self-closing
        // dont put BRs in inline elements, please.
        if (isEmpty(node) &&
          node.textContent.trim() === '' &&
          !contains(html5VoidElements, node.nodeName) &&
          element.isBlockElement(node)) {
          node.appendChild(document.createElement('br'));
        } else if (node.children.length > 0) {
          if (!config.skipElement || !(config.skipElement && config.skipElement(node))) {
            traverse(node, config);
          }
        }
      }
      node = node.nextElementSibling;
    }
  }

  return function (config) {
    return function (scribe) {

      scribe.registerHTMLFormatter('normalize', function (html) {
        var bin = document.createElement('div');
        bin.innerHTML = html;

        traverse(bin, config);

        return bin.innerHTML;
      });

    };
  };

});
