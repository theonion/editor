/* Editor's interface to global Undo */

(function(global) {
    'use strict';
    var EditorUndo = EditorUndo || function(editor, options) {
        var self = this;

        // TODO: Need a way to block undo/redo from browser menu 
        editor.on("init", init);

        function init() {
            if (options.undoManager) {
                //set the initial state
                options.undoManager.pushInitialState(
                self,
                {   
                    editorInstance: options.element.id,         
                    content: jQuery.extend(true, {}, editor.content),
                    selection: ""
                
                });
                
                editor.on("contentchanged", changed);
            }
        }

        function changed() {
            setTimeout(function() {
                options.undoManager.pushState(
                self,
                {   
                    editorInstance: options.element.id,             
                    content: jQuery.extend(true, {}, editor.content),
                    selection: editor.serializeRange()
                
                });
            }, 10)
            // let's put some hacks in here to persist
            //localStorage["editor-" + options.uniqueID] = content;
        }

        self.setState = function(data) {
            //STOP LISTENING FOR CHANGES. Don't want undo/redo to contiune to add to the stack!
            editor.dontListenForChanges()
            editor.content = jQuery.extend(true, {}, data.content);
            editor.renderContent();
            if (typeof window.picturefill === "function") {
                window.picturefill();
            }
            editor.deserializeRange(data.selection)
            //START LISTENING AGAIN
            editor.listenForChanges()
        }
    }
    global.EditorModules.push(EditorUndo);
})(this);