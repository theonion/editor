(function(global) {
    'use strict';
    var TextReplacement = TextReplacement || function(editor, options) {
        var self = this;

        function _getPrecedingCharacter() {
            var sel = window.getSelection();
            if (sel.focusOffset == 0) {
                return -1
            }
            else {
                return sel.focusNode.textContent.substr(sel.focusOffset-1, 1).charCodeAt(0);
            }
        }

        function replaceText(e) {
            if (e.keyCode == 222) { //either a single quote or double quote was pressed                
                var p = _getPrecedingCharacter();
                var chr;
                switch (p) {
                    case -1:  //no character
                    case 32:  //space
                    case 160: //nbsp
                        if (e.shiftKey) 
                            chr = "&ldquo;";
                        else
                            chr = "&lsquo;";
                    break;
                    default: 
                        if (e.shiftKey) 
                            chr = "&rdquo;";
                        else
                            chr = "&rsquo;";
                }
                document.execCommand("InsertHTML", false, chr);
                e.preventDefault();
            }

        }  
        editor.on("keydown", replaceText);
    }
    global.EditorModules.push(TextReplacement);
})(this)

