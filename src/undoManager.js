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
            undoStack = [],
            position = -1;

        self.undoStack = undoStack;

        /*  savedSelection = rangy.serializeSelection(undefined, true );

            rangy.deserializeSelection( state.selection);
        */

        self.pushState = function(obj, data) {
            // clear all parts of the stack after the current position
            if (position < undoStack.length - 1) {
                undoStack = undoStack.splice(0, position + 1)
            }

            undoStack.push({
                obj: obj,
                data: data
            });
            position++;                    
        }

        self.dumpStack = function() {
            console.log("Position: " , position);
            console.log(undoStack)
        }

        function undo() {
            if (position > 0) {
                console.log(position)
                undoStack[position].obj.setState(undoStack[position].data.previous)
                position--;
            }
        }

        function redo() {
            if (position < undoStack.length -1 ) {
                position++;
                undoStack[position].obj.setState(undoStack[position].data.current)
            }
        }

        function init() {
            key('⌘+z, ctrl+z', function(e) {
                e.preventDefault();
                undo()
            });

            key('shift+⌘+z, shift+ctrl+z', function(e) {
                e.preventDefault();
                redo();
            });
        }

        init();
    }
    global.UndoManager = UndoManager;
    return self;
})(this)