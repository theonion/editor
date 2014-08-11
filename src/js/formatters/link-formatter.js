define([
    'scribe-common/src/element',
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

  
  return function (config) {
    return function (scribe) {

      function fixLink(url) {
        url = url.trim();
        url = fixProtocol(url);
        if (config.domain) {
          url = makeRelative(url, config.domain);
        }
        return url
      }

      function makeRelative(url, domain) {
          var a = document.createElement("a");
          a.href = url;
          // check if it's an avclub link
          var host = a.hostname;
          // also check that there's a path at the end
          if (host.indexOf(domain) > -1 && a.pathname.length > 1) {
              url = a.pathname + a.search + a.hash;
          }
          return url;
      }

      function fixProtocol(url) {
        if (
            url.substr(0, 7) !== "http://" &&
            url.substr(0, 8) !== "https://" &&
            url.substr(0, 7) !== "mailto:" &&
            url.substr(0, 1) !== "/" 
            ) {
            // check for email, but default to http
            if (url.indexOf("@") != -1) {
              return "mailto:" + url;
            } else {
              return "http://" + url;
            }
        } else {
            return url;
        }
      }

      function traverse(parentNode) {
        var node = parentNode.firstElementChild;

        function isEmpty(node) {
          return node.children.length === 0
            || (node.children.length === 1
                && element.isSelectionMarkerNode(node.children[0]));
        }

        while (node) {
          if (node.nodeName === 'A') {
            if (node.hasAttribute('href')) {
              node.setAttribute('href', fixLink(node.getAttribute('href')));
            }
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
