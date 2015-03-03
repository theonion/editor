define('scribe-plugin-anchor',[],function () {
  return function (config) {
    return function (scribe) {
      var anchorCommand = new scribe.api.Command('anchor');

      function getSlug(text) {
      	return text.toString().toLowerCase()
    			.replace(/\s+/g, '-')           // Replace spaces with -
    			.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    			.replace(/\-\-+/g, '-')
    			.trim();
      }

      anchorCommand.queryEnabled = function () {
        var selection = new scribe.api.Selection();
        var targetNode = selection.getContaining(function(node){
          return true;
        });
        return targetNode !== undefined;
      }

      anchorCommand.queryState = function (value) {
      	var selection = new scribe.api.Selection();
        var targetNode = selection.getContaining(function(node){
          return node.nodeType !== 3;
        });
        if (targetNode === undefined) {
          return false;
        }
        return !! targetNode.id
      };

      anchorCommand.execute = function () {
        var selection = new scribe.api.Selection();
        console.log(selection);
        var targetNode = selection.getContaining(function(node){
        	return node.nodeType !== 3;
        });
        console.log(targetNode);

      	scribe.transactionManager.run(function () {
        	if (targetNode.id) {
            targetNode.removeAttribute('id');
        	} else {
        		targetNode.id = getSlug(targetNode.textContent);
        	}
      	}.bind(this));
      };

      scribe.commands.toggleAnchor = anchorCommand;
    };
  }
});