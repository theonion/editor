define([
    'scribe-common/element',
    'lodash-amd/modern/collections/contains'

  ], function (
    element,
    contains
  ) {

  /**
   * This formatter will make sure any urls
   * that are supposed to be relative stay relative to a configured
   * http://www.avclub.com/some-article ==> /some-article
   */

  'use strict';

  // http://www.w3.org/TR/html-markup/syntax.html#syntax-elements

  function traverse(parentNode) {
    // Instead of TreeWalker, which gets confused when the BR is added to the dom,
    // we recursively traverse the tree to look for an empty node that can have childNodes

    var node = parentNode.firstElementChild;

    function isEmpty(node) {
      return node.children.length === 0
        || (node.children.length === 1
            && element.isSelectionMarkerNode(node.children[0]));
    }

    while (node) {
      if (node.nodeName === "A") {
        console.log(node.getAttribute("href"));
      }
      else if (node.children.length > 0) {
        traverse(node);
      }
      node = node.nextElementSibling;
    }
  }

  return function () {
    return function (scribe) {

      scribe.registerHTMLFormatter('normalize', function (html) {
        var bin = document.createElement('div');
        bin.innerHTML = html;

        traverse(bin);

        return bin.innerHTML;
      });

    };
  };

});
