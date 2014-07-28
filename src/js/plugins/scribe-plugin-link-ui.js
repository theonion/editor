/* A friendly UI for adding links. */

define('scribe-plugin-link-ui',[],function () {

  /**
   * This plugin adds a command for creating links, including a basic prompt.
   */
  return function (config) {
    return function (scribe) {

      var editorEl = scribe.el.parentNode,
          linkPromptCommand = new scribe.api.Command('createLink');
      var $linkTools = $('.link-tools', editorEl),
          $input = $('.link-tools input', editorEl),
          placeHolder = '#replaceme';
      var $results = $('.search-results', $linkTools);

      // this provides a way to externally udpate the results element. 
      var searchHandler = config.searchHandler || function(term, resultsElement) { };

      linkPromptCommand.nodeName = 'A';

      linkPromptCommand.execute = function () {
        var cmd = this,
          selection = new scribe.api.Selection();
        if (!selection.range.collapsed) {
          scribe._skipFormatters = true; // This is a little fucked... 
          scribe.api.SimpleCommand.prototype.execute.call(cmd, placeHolder);  
          showInput($('a[href*=' + placeHolder + ']')); 
        }
      };

      $('.remove', $linkTools).click(function() {
        $input.val('');
        confirmInput();
      });

      $('.ok', $linkTools).click(confirmInput);

      $results.click(function(e) {
        if (e.target.tagName == "A") {
          e.preventDefault();
          $input.val(e.target.getAttribute("href"));
          updateResults();
        }
      });


      $input
        .bind('keyup', updateResults)
        .bind('keydown', function(e) {
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
            e.preventDefault();
          }
        }
      })


      var searchTimeout;
      function updateResults() {
        var v = $input.val();
        if (isSearchTerm(v)) {
          clearTimeout(searchTimeout);
          searchTimeout = setTimeout(searchHandler, 200, v, $results);
          $results.show();
        }
        else {
          $results.hide();
        }
      }

      // cheap way to see if we're searching for something, or entering a url
      function isSearchTerm(s) {
        if (s.indexOf(".") > -1 || s.indexOf("/") > -1 ||
          s.indexOf("www") > -1 || s.indexOf("http://") > -1 ||
          s.indexOf("https://") > -1 || s === "") {
          return false;
        }
        else {
          return true;
        }
      }

      function showInput(linkElement) {
        updateResults();
        $linkTools.show();
        linkElement.addClass('link-edit');
        setTimeout(function() {
          $("body, .link-tools .close").bind('click', closeByClick);
          $input.val(linkElement.attr('href').replace(placeHolder, ""))
          $input[0].focus();
        }, 10)
      }

      function closeByClick(e) {
        if ($(e.target).closest(".link-tools").length === 0) {
          confirmInput();
        }
      }

      function confirmInput() {
        scribe.updateContents(function() {
          var linkVal = $input.val();
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
        $linkTools.hide();
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