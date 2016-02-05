define(['scribe-common/src/element'], function (scribeElement) {
  'user strict';

  return function () {
    return function (scribe) {
      function traverse (parentNode) {
        var node = parentNode.firstElementChild;

        while (node) {
          if (node.filterForExport) {
            node.filterForExport();
          }

          if (node.children.length > 0) {
            traverse(node);
          }

          node = node.nextElementSibling;
        }
      }

      scribe.registerHTMLFormatter('export', function (html) {
        var bin = document.createElement('div');
        bin.innerHTML = html;
        traverse(bin);
        return bin.innerHTML;
      });
    };
  };

});
