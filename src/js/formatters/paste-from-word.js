define(['scribe-common/src/element'], function (scribeElement) {

  'use strict';

  return function () {
    return function (scribe) {

      // Flagrantly lifted from TinyMCE
      function isWordContent(html) {
        return (
          (/<font face="Times New Roman"|class="?Mso|style="[^"]*\bmso-|style='[^'']*\bmso-|w:WordDocument/i).test(html) ||
          (/class="OutlineElement/).test(html) ||
          (/id="?docs\-internal\-guid\-/.test(html))
        );
      }

      function traverse(parentNode) {
        var node = parentNode.firstElementChild;
        
        while (node) {
          var nextNode = node.nextElementSibling;

          // Kill "Mso*" class names
          if (node.className.indexOf('Mso') === 0) {
            node.className = null;
          }

          if (node.hasAttribute('style')) {
            node.removeAttribute('style');
          }

          if (node.children.length > 0) {
            traverse(node);
          }

          // Kill bullshit a tags
          if (node.nodeName === 'A') {
            if (!node.href) {  // There are a bunch of tags taht are basically bookmarks. We don't need 'em.
              scribeElement.unwrap(parentNode, node);
            }
          }

          // SPANs can GET FUCKED
          if (node.nodeName === 'SPAN') {
            scribeElement.unwrap(parentNode, node);
          }

          // There seem to be a bunch of empty p tags, that cause all kinds of trouble.
          if (node.nodeName === 'P' && node.textContent.trim() === '') {
            parentNode.removeChild(node); // Kill these empty p tagz
          }

          node = nextNode;
        }
      }

      scribe.registerHTMLFormatter('paste', function (html) {
        if (!isWordContent(html)) {
          // We only want to fuck with word docs. Word docs are crazy.
          return html;
        }

        // Word comments like conditional comments etc
        html = html.replace(/<!--[\s\S]+?-->/gi, '');

        // Remove comments, scripts (e.g., msoShowComment), XML tag, VML content,
        // MS Office namespaced tags, and a few other tags
        html = html.replace(/<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|img|meta|link|style|\w:\w+)(?=[\s\/>]))[^>]*>/gi, '');
        
        // Now let's use this thing as a doc.
        var bin = document.createElement('div');
        bin.innerHTML = html;
        console.log(bin);

        traverse(bin);

        // In the end, we really only care about the body.
        console.log(bin.innerHTML);
        return bin.innerHTML;
      });
    };
  };

});