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

	      return !! selection.getContaining(function (node) {
          if (node === undefined) {
            return null;
          }

	      	if (node.nodeType === 3) {
	      		node = node.parentNode;
	      	}
	      	return node.id;
	      }.bind(this));
      };

      anchorCommand.execute = function () {
        var selection = new scribe.api.Selection();
        var targetNode = selection.getContaining(function(node){
        	return true;
        });
        while (targetNode.nodeType === 3) {
        	targetNode = targetNode.parentNode;
        }


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