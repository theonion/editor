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

          $(".inline-tools button", editorEl.parentNode).click(function(event) {

            var name = $(event.target).attr("name");
            console.log("button clicked:", name);
            if (typeof actions[name] === "function") {
              actions[name]();
            }
          });
        }

        function insertObject(event) {
          //derive type from button clicked.
          var type = $(event.target).closest("button").data("commandName");
          //emit an event, so handler plugin can pick up.
          scribe.trigger("inline:insert:" + type, [
            activeBlock, 
            function(block, values) {              
              scribe.updateContents(function() {
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
        });

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

        function getSizes() {
          return templates[$(activeElement).attr("data-type")].size;
        }

        function getCrops() {
          return templates[$(activeElement).attr("data-type")].crop;
        }

        //TODO: Determine how to handle two adjacent inline elements. Probably skip over?
        var actions = {

          inline_caption: function() {
            var caption = prompt("Caption", 
              $(".caption", activeElement).html()
            );
            if (caption) {
              scribe.updateContents(function() {
                $(".caption", activeElement).html(caption);
              });
            }
          },
          //TODO: size/crop isn't working right after you hit the "HUGE" size in images
          inline_size: function() {
            var l = getSizes();
            toggleAttribute("size", l);

            var currentCrop = $(activeElement).attr("data-crop");
            var cropOptions = getCrops();
            //this crop isn't available for the new size option
            if (cropOptions.indexOf(currentCrop) === -1) {
              setValue("crop", cropOptions[0]);
            }
          },
          inline_crop: function() {
            var l = templates[$(activeElement).attr("data-type")].crop;
            toggleAttribute("crop", l);
          },
          inline_up: function() {
             hideToolbar();
            var previousBlock = $(activeElement).prev()[0];
            if (previousBlock) {
              var top = $(activeElement).offset().top;

              scribe.updateContents(function() {
                $(activeElement).after(previousBlock);
               
                setTimeout(function() {
                  showToolbar();
                  var newTop = $(activeElement).offset().top;
                  window.scrollBy(0, newTop - top)
                }, 0);
              });
            }
          },
          inline_down: function() {
            hideToolbar();
            var nextBlock = $(activeElement).next()[0];
            if (nextBlock) {
              var top = $(activeElement).offset().top;
              scribe.updateContents(function() {
                $(activeElement).before(nextBlock);
                
                setTimeout(function() {
                  showToolbar();
                  var newTop = $(activeElement).offset().top;
                  window.scrollBy(0, newTop - top)
                }, 0);
              });
            }
          },
          inline_remove: function () {
            scribe.updateContents(function() {
              $(activeElement).remove();
            });
            hideToolbar()
          },  
          inline_edit: function () {
            scribe.trigger("inline:edit:" + $(activeElement).attr("data-type"), 
              [
                activeElement,
                function(element, values) {
                  var type = $(element).attr("data-type");
                  scribe.updateContents(function() {
                    element.outerHTML = 
                      render(
                        templates[type].template,
                        $.extend(templates[type].defaults, values) 
                      )
                  });
                }
              ]
            )
          }
        }

        function toggleAttribute(attribute, list) {
          var currentValue = $(activeElement).attr("data-" + attribute);
          var index = list.indexOf(currentValue) + 1;
          if (index >= list.length)
            index = 0;
          setValue(attribute, list[index]);
          if (typeof window.picturefill === "function") {
            setTimeout(window.picturefill, 100);
          }
        } 

        function setValue(attribute, value) {
          var currentValue = $(activeElement).attr("data-" + attribute);
          scribe.updateContents(function() {
            $(activeElement)
              .removeClass(attribute + "-" + currentValue)
              .addClass(attribute + "-" + value)
              .attr("data-" + attribute, value)
              showToolbar();
          });
        }

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