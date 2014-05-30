define('scribe-plugin-inline-objects',[],function () {

  /**
   * Adds support for inserting, like embeds, videos and images.
   */
  return function (config) {
    return function (scribe) {
        // define inline objects
        
        var editorEl = scribe.el.parentNode;
        
        var templates;
        var activeBlock, activeElement;

        // Load the config. 
        $.ajax(config, {success: configLoaded});

        function configLoaded(data) {
          templates = data;
          $(".embed-tools button", editorEl).click(insertObject);
        }
        
        function insertObject(event) {
          //derive type from button clicked.
          var type = $(event.target).closest("button").data("commandName");
          //emit an event, so handler plugin can pick up.
          scribe.trigger("inline:" + type, [
            activeBlock, 
            function(block, values) {
                scribe.transactionManager.run(function () {
                  var html = render(
                      templates[type].template, 
                      $.extend(templates[type].defaults, values) 
                  );
                  $(block).before(html); 
                  $(".inline", editorEl).attr("contenteditable", "false"); 
                });
            }
          ]);
          $(".embed-tools", editorEl).removeClass("active");
          activeBlock = undefined;
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
            $(".embed-tools",editorEl)
                .css({ top: top   })
                .addClass("active");
            activeBlock = blocks[i];
          }
          else {
            $(".embed-tools", editorEl).removeClass("active");
          }
        });

        scribe.el.parentNode.addEventListener('mouseleave', function (event) {
          $(".embed-tools", editorEl).removeClass("active");
        });


        // Edit Button



        // Overlay options
        $(".editor", editorEl).mouseover( function(e) {
          //check to see if the target is inside of an inline element
          var parents = $(e.target).parents('.inline');
          if (parents.length == 1) {
            //let's position tools over the inline element
            activeElement = parents[parents.length-1];
            showToolbar()
          }
          else {
            hideToolbar();
          }
          function hideToolbar() {
            $(".inline-tools").hide();
            $(editorEl).removeClass("inline-active")
          }

          function showToolbar() {
            var el = $(activeElement);
            var pos = el.position();
            $(editorEl).addClass("inline-active");
            
            //set size buttons.

            $(".inline-tools .size", editorEl)
              .html($(activeElement).attr("data-size"));

            //set crop
            $(".inline-tools .crop", editorEl)
              .html($(activeElement).attr("data-crop"));

            $(".inline-tools", editorEl)
              .css({
                top: pos.top + parseInt(el.css('margin-top')), 
                left: pos.left + parseInt(el.css('margin-left')) + parseInt($(".editor", editorEl).css('margin-left')),
                width: el.width(),
                height: el.height()
              })
              .show();
          }
        });

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