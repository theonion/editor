define('scribe-plugin-inline-objects',[],function () {

  /**
   * Adds support for inserting, like embeds, videos and images.
   */
  return function (config) {
    return function (scribe) {
        // define inline objects
        

        
        var templates;
        var activeBlock;

        // Load the config. 
        $.ajax(config, {success: configLoaded});

        function configLoaded(data) {
          templates = data;
          $(".embed-tools button", scribe.el.parentNode).click(insertObject);
        }
        
        function insertObject(event) {
          //derive type from button clicked.
          var type = $(event.target).closest("button").data("commandName");
          //emit an event, so handler plugin can pick up.
          console.log(scribe.trigger);
          scribe.trigger("inline:" + type, [
            activeBlock, 
            function(block, values) {
                scribe.transactionManager.run(function () {
                  var html = render(
                      templates[type].template, 
                      $.extend(templates[type].defaults, values) 
                  );
                  console.log(html);
                  $(block).before(html); 
                  $(".inline").attr("contenteditable", "false"); 
                });
            }
          ]);
        }

        // Edit action
        function edit(event) {

        }


        // Insert toolbar. 
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


        // Edit Button



        // Overlay options


        // Caption (keep this in for now, for simplicity)


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