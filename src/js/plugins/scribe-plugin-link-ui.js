/* A friendly UI for adding links. */

define('scribe-plugin-link-ui',[],function () {

  /**
   * This plugin adds a command for creating links, including a basic prompt.
   */
  return function (config) {
    return function (scribe) {


      var editorEl = scribe.el.parentNode,
        linkPromptCommand = new scribe.api.Command('createLink');
      var linkToolsEl = $('.link-tools', editorEl),
        inputEl = $('.link-tools input', editorEl),
        placeHolder = '#replaceme';


      linkPromptCommand.nodeName = 'A';

      linkPromptCommand.execute = function () {
        var cmd = this,
          selection = new scribe.api.Selection();

        //TODO: Make sure there isn't a link in here, or any other block elements. Make sure there is a 
        if (!selection.range.collapsed) {
          scribe._skipFormatters = true; // This is a little fucked... 
          scribe.api.SimpleCommand.prototype.execute.call(cmd, placeHolder);  
          showInput($('a[href*=' + placeHolder + ']')); 
        }
      };

      $('.remove', linkToolsEl).click(function() {
        inputEl.val('');
      });

      inputEl.bind('keydown', function(e) {
        if (e.keyCode === 13 || e.keyCode === 27) {
          confirmInput();
        }
      });

      scribe.el.addEventListener('click', function(e) {
        // is there a link
        var selection = new scribe.api.Selection();
        if (selection.range) {
          var linkElement = $(e.target).closest('a');
          if (linkElement.length === 1) {
            showInput(linkElement);
          }
        }
      })

      function showInput(linkElement) {
        linkToolsEl.show();
        linkElement.addClass('link-edit');

        setTimeout(function() {
          $("body, .link-tools .close").bind('click', closeByClick);
          inputEl
            .val(linkElement.attr('href').replace(placeHolder, ""))
          inputEl[0].focus();
        }, 10)
      }

      function closeByClick(e) {
        if ($(e.target).closest(".link-tools input").length === 0) {
          confirmInput();
        }
      }

      function confirmInput() {
        scribe.updateContents(function() {
          var linkVal = inputEl.val();
          if (linkVal === "") {
            removeLink();
          }
          else {
            $('.link-edit, [href=' + placeHolder + ']')
              .attr('href', linkVal)
              .removeClass('link-edit');
          }
        });
        $('body, .link-tools .close').unbind('click');
        linkToolsEl.hide();
      }

      function removeLink() {
        var link = $('.link-edit, [href*=' + placeHolder + ']');
        link[0].outerHTML = link[0].innerHTML;
      }

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

      scribe.commands.linkUI = linkPromptCommand;
    };
  };

});