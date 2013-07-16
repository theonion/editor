(function(global) {
    'use strict';
    var Formatting = Formatting || function(editor, options) {
        var self = this;

        key('⌘+b, ctrl+b', _bold);
        key('⌘+i, ctrl+i', _italic);
        key('⌘+u, ctrl+u', _underline);

        function _bold() {
            document.execCommand("BOLD");
        }
        
        function _italic() {
            document.execCommand("ITALIC");
        }

        function _underline(){ 
            document.execCommand("UNDERLINE");
        }

        function _strikethrough() {
            document.execCommand("STRIKETHROUGH");
        }

        function _superscript(){ 
            document.execCommand("superscript");
        }

        function _subscript() {
            document.execCommand("subscript");
        }

        function _unorderedList() {
            document.execCommand('insertUnorderedList', null, null)
        }

        function _orderedList() {
            document.execCommand('insertOrderedList', null, null)
        }

        function _blockquote(){ 
            document.execCommand('formatBlock', null, '<blockquote>')

        }

        function _toggleVisualize() {
            $(options.element).find(".editor").toggleClass("visualize");
        }


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

        editor.on("toolbar:click:special-chars", function() { alert("Special character palette")});
    }
    global.EditorModules.push(Formatting);
})(this)
          



/* Editing commands */
/*
  <button class="textstyle icon-italic" data-nodetype="I" title="Italic"></button>

function _bold() {
    document.execCommand("BOLD");
}
function _italic() {
    document.execCommand("ITALIC");
}
function _underline(){ 
    document.execCommand("UNDERLINE");
}
function _strikethrough() {
    document.execCommand("STRIKETHROUGH");
}
function _blockquote() {
    document.execCommand("FORMATBLOCK", false, "<blockquote>");
}
function _undo(){ 
    document.execCommand("UNDO", false, "");
}
function _redo(){ 
    document.execCommand("REDO", false, "");
}
function _link() {
    if (document.execCommand("createLink", true, "#replaceme")) {
        sel = window.getSelection();
        range = sel.getRangeAt(0);
        _editLink(range.commonAncestorContainer.parentElement);    
    }
}
function _orderedList() {
    document.execCommand("insertorderedlist", false, null);   
}
function _unorderedList() {
    document.execCommand("insertunorderedlist", false, null);   
}

key('⌘+b, ctrl+b', _bold);
key('⌘+i, ctrl+i', _italic);
key('⌘+u, ctrl+u', _underline);

$("#toolbar .icon-bold").click(_bold);
$("#toolbar .icon-italic").click(_italic);
$("#toolbar .icon-underline").click(_underline);
$("#toolbar .icon-strikethrough").click(_strikethrough);
$("#icontoolbar .icon-list-ol").click(_orderedList);
$("#icontoolbar .icon-list-ul").click(_unorderedList);
$("#toolbar .icon-link").click(_link);
// $("#toolbar .icon-quote-left").click(_blockquote);
$("#undoBtn").click(_undo);
$("#redoBtn").click(_redo);
*/


