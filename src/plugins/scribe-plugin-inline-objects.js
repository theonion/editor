define('scribe-plugin-inline-objects',[],function () {

  /**
   * Adds support for inserting, like embeds, videos and images.
   */


  return function (config) {
    return function (scribe) {
        // define inline objects
        

        // OK, we need to load the config. 

        var templates;
        $.ajax(config, {success: configLoaded});

        function configLoaded(data) {
          templates = data;;
          $(".embed-tools button", scribe.el.parentNode).click(toolbarClick);
        }
        
        function insertAbove(element, html) {
          scribe.transactionManager.run(function () {
            $(element).before(html);
            $(".inline").attr("contenteditable", "false"); 
          });
        }

        function insert(event) {
          var type = $(event.target).closest("button").data("commandName");
          scribe.emit("inline:" + type, {
            block: activeBlock,
            onSuccess: function(block, values) {
              insertAbove(activeBlock, 
                render(templates[type].template, 
                $.extend(templates[type].defaults, values) ) ) 
            }
          });
        }

        function edit(event) {
          
        }


        var activeBlock;

        // THIS DOES THE TOOLBAR STUFF
        scribe.el.addEventListener('mouseover', function (event) {
          var blocks = scribe.el.children;
          var cursorOffset = event.y;
          for (var i = 0; i < blocks.length; i++) {
            if (cursorOffset < blocks[i].offsetTop + 25  ) {
              break;
            }
          }
          if (blocks[i]) {
            var top = blocks[i].offsetTop;
            $(".embed-tools", scribe.el.parentNode)
                .css({ top: top   })
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




        function render(html, dict) {
          for (var k in dict) {
              if (k) {
                  html = html.replace(new RegExp("{{" + k + "}}", 'g'), dict[k]);
              }
          }
          return html;
        }

    }
  }
});