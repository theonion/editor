/* Editor's interface to global Undo */

(function(global) {
    'use strict';
    var EditorUndo = EditorUndo || function(editor, options) {
        var self = this;

        // TODO: Need a way to block undo/redo from browser menu 


        if (options.undoManager) {
            editor.on("contentchanged", changed);
        }
        function changed() {
            options.undoManager.pushState(
            self,
            {
                previous: editor.stashedState,
                current: {
                    content: editor.getContent(),
                    selection: editor.serializeRange()
                }
            });
        }


        self.setState = function(data) {
            //STOP LISTENING FOR CHANGES. Don't want undo/redo to contiune to add to the stack!
            editor.dontListenForChanges()
            editor.setContent(data.content)
            editor.deserializeRange(data.selection)
            //START LISTENING AGAIN
            editor.listenForChanges()
        }
    }
    global.EditorModules.push(EditorUndo);
})(this);