/* 

UndoManager is generic & shared across any widget that wants to add its commands to the undo stack.

Making a few assumptions, for now:
1. It is OK to override cmd+z, cmd+shift+z for the entire page. 
2. Defines the global stack & keybindings. Walks through the stack
*/

(function(global) {
    'use strict';
    var UndoManager = UndoManager || function() {
        var self = this,
            UNDO_LEVELS = 9999999,
            undoTimeout,
            undoStack = [],
            position = -1,
            currentState;



        self.undoStack = undoStack;



        


        /*  savedSelection = rangy.serializeSelection(undefined, true );

            rangy.deserializeSelection( state.selection);
        */
        console.log(this);
        self.addCommand = function(commandObj) {
            undoStack.push(commandObj);            
        }



        function undo() {

        }

        function redo() {

        }

        function init() {
            console.log("undo init");
            key('⌘+z, ctrl+z', function(e) {
                e.preventDefault();
                console.log("cmd+z")
            });

            key('shift+⌘+z, shift+ctrl+z', function(e) {
                e.preventDefault();
                console.log("cmd+shift + z")

            });
        }

        init();
    }
    global.UndoManager = UndoManager;
})(this)