/* replacement for scribe's default plug in */

define('scribe-plugin-link-ui',[],function () {

  /**
   * This plugin adds a command for creating links, including a basic prompt.
   */
  return function (config) {
    return function (scribe) {


      var editorEl = scribe.el.parentNode;

      var linkPromptCommand = new scribe.api.Command('createLink');

      linkPromptCommand.nodeName = 'A';

      linkPromptCommand.execute = function () {

        function showInput() {
          $("body").bind('click', closeByClick);
          $(".link-tools", editorEl).show();
        }

        function closeByClick() {
          confirmInput();
        }

        var cmd = this; 

        function confirmInput() {
          $("body").unbind('click', closeByClick);
          $(".link-tools", editorEl).show();
        }


        var initialLink = anchorNode ? anchorNode.href : 'http://';
        //var link = window.prompt('Enter a link.', initialLink);
        var selection = new scribe.api.Selection();
        var range = selection.range;
        var anchorNode = selection.getContaining(function (node) {
          return node.nodeName === this.nodeName;
        }.bind(this));


        if (anchorNode) {
          range.selectNode(anchorNode);
          selection.selection.removeAllRanges(range);
          selection.selection.addRange(range);
        }

        var rangeCopy = selection.clone();

        console.log(rangeCopy);
        scribe.api.SimpleCommand.prototype.execute.call(cmd, "#");
        
        
      };

      linkPromptCommand.queryState = function () {
        /**
         * We override the native `document.queryCommandState` for links because
         * the `createLink` and `unlink` commands are not supported.
         * As per: http://jsbin.com/OCiJUZO/1/edit?js,console,output
         */
        var selection = new scribe.api.Selection();
        return !! selection.getContaining(function (node) {
          return node.nodeName === this.nodeName;
        }.bind(this));
      };

      scribe.commands.linkPrompt = linkPromptCommand;
    };
  };

});

//# sourceMappingURL=scribe-plugin-link-prompt-command.js.map