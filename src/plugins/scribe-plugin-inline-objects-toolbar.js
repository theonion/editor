define('scribe-plugin-inline-objects-toolbar',['scribe-plugin-inline-objects'],function () {

  /* This toolbar is special. It doesn't alter text but maps to inlineObject stuff. */

  return function (toolbarNode) {
    return function (scribe) {
      var buttons = toolbarNode.querySelectorAll('button');


      console.log("inline objects toolbar");
      Array.prototype.forEach.call(buttons, function (button) {
        // Look for a predefined command, otherwise define one now.
        

        console.log(button.dataset.commandName);

        button.addEventListener('click', function () {

          console.log(this.dataset.commandName);
  
          
        });

        // Keep the state of toolbar buttons in sync with the current selection.
        // Unfortunately, there is no `selectionchange` event.
        
        // We also want to update the UI whenever the content changes. This
        // could be when one of the toolbar buttons is actioned.
        // TODO: The `input` event does not trigger when we manipulate the content
        // ourselves. Maybe commands should fire events when they are activated.
        scribe.on('content-changed', updateUi);

        function updateUi() {
          /*
          var selection = new scribe.api.Selection();

          if (selection.range) {
            if (command.queryEnabled()) {
              button.removeAttribute('disabled');

              if (command.queryState()) {
                button.classList.add('active');
              } else {
                button.classList.remove('active');
              }
            } else {
              button.setAttribute('disabled', 'disabled');
            }
          }
          */
        }
      });
    };
  };

});

//# sourceMappingURL=scribe-plugin-toolbar.js.map