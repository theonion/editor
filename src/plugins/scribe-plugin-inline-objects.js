define('scribe-plugin-inline-objects',[],function () {

  /**
   * Adds support for inserting, like embeds, videos and images.
   */


  return function (config) {
    return function (scribe) {
        // define inline objects
        
       
        
        function insertAbove(element, html) {
          scribe.transactionManager.run(function () {
            $(element).before(html);
          });
        }

        function toolbarClick(event) {
          event.target.dataset.commandName;
          insertAbove(activeBlock, "<div style='width: 100%; height: 200px;background-color:red;'></div>");
        }

        $(".embed-tools button", scribe.el.parentNode).click(toolbarClick);


        var activeBlock;


        scribe.el.addEventListener('mouseover', function (event) {
          var blocks = scribe.el.children;
          var cursorOffset = event.clientY + window.scrollY;
          for (var i = 0; i < blocks.length; i++) {
            if (cursorOffset < blocks[i].offsetTop + 25  ) {
              break;
            }
          }
          if (blocks[i]) {
            var top = blocks[i].offsetTop;
            
            $(".embed-tools", scribe.el.parentNode)
                .css({ top: top - 35  })
                .addClass("active");
            activeBlock = blocks[i];
          }
          else {
            $(".embed-tools", scribe.el.parentNode).removeClass("active");
          }
        });

        scribe.el.parentNode.addEventListener('mouseleave', function (event) {
          $(".embed-tools", scribe.el.parentNode).removeClass("active");
        });

    }
  }
});