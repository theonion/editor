(function(global) {
    'use strict';
    var RichText = RichText || function(editor, options) {
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

        editor.on("toolbar:click:italic", _italic);
        editor.on("toolbar:click:bold", _bold);
        editor.on("toolbar:click:underline", _underline);
        editor.on("toolbar:click:strikethrough", _strikethrough);

        editor.on("toolbar:ready", function() {
            editor.toolbar.addButton({ name: "bold",  icon: "icon-bold"});
            editor.toolbar.addButton({ name: "italic", icon: "icon-italic"});
            editor.toolbar.addButton({ name: "underline", icon: "icon-underline"});
            editor.toolbar.addButton({ name: "strikethrough", icon: "icon-strikethrough"});
            editor.toolbar.addSpacer();

        });
    }
    global.EditorModules.push(RichText);
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


