(function(global) {
    'use strict';
    var Formatting = Formatting || function(editor, options) {
        var self = this;

        var cmd = global.document.execCommand;
        key('⌘+b, ctrl+b', _bold);
        key('⌘+i, ctrl+i', _italic);
        key('⌘+u, ctrl+u', _underline);

        function _bold() {
            cmd("bold");
        }
        
        function _italic() {
            cmd("italic");
        }

        function _underline(){ 
            cmd("underline");
        }

        function _strikethrough() {
            cmd("strikethrough");
        }

        function _superscript(){ 
            cmd("superscript");
        }

        function _subscript() {
            cmd("subscript");
        }

        function _unorderedList() {
            cmd('insertUnorderedList', null, null)
        }

        function _orderedList() {
            cmd('insertOrderedList', null, null)
        }

        function _blockquote(){ 
            cmd('formatBlock', null, '<blockquote>')
        }

        function _toggleVisualize() {
            $(options.element).find(".editor").toggleClass("visualize");
        }

        //not really formatting. Keeep here for now. We may need to custom build an undo/redo stack.
        function _undo(){ 
            cmd("undo", false, "");
        }
        function _redo(){ 
            cmd("redo", false, "");
        }

        /*
        function _link() {
            if (cmd("createLink", true, "#replaceme")) {
                sel = window.getSelection();
                range = sel.getRangeAt(0);
                _editLink(range.commonAncestorContainer.parentElement);    
            }
        }
        */

        editor.on("toolbar:click:italic", _italic);
        editor.on("toolbar:click:bold", _bold);
        editor.on("toolbar:click:underline", _underline);
        editor.on("toolbar:click:strikethrough", _strikethrough);
        editor.on("toolbar:click:blockquote", _blockquote);
        editor.on("toolbar:click:superscript", _subscript);
        editor.on("toolbar:click:subscript", _superscript);
        editor.on("toolbar:click:unorderedlist", _unorderedList);
        editor.on("toolbar:click:orderedlist", _orderedList);

        editor.on("toolbar:click:visualize", _toggleVisualize);
        editor.on("toolbar:click:undo", _undo);
        editor.on("toolbar:click:redo", _redo);

        editor.on("toolbar:click:special-chars", function() { alert("Special character palette")});
    }
    global.EditorModules.push(Formatting);
})(this)

