(function(global) {
    'use strict';
    var TextReplacement = TextReplacement || function(editor, options) {
        var self = this;

        function _getPreedingCharacter() {
            var containerEl = $(".focus")[0];
            var precedingChr = "", sel, range, precedingRange;
            sel = window.getSelection();
            try {
                if (sel.rangeCount > 0) {
                    range = sel.getRangeAt(0).cloneRange();
                    range.collapse(true);
                    range.setStart(containerEl, 0);
                    precedingChr = range.toString().slice(-1);
                }
                chrCode = precedingChr.charCodeAt(0);
                if (isNaN(chrCode)) {
                    return -1;
                }
                else {
                    return chrCode;
                }
            }
            catch (err) {
                return -1;
            }
        }

        function replaceText() {
            e = this;
            if (e.keyCode == 222) { //either a single quote or double quote was pressed                
                switch (_getPreedingCharacter()) {
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
        editor.on("keyup", replaceText);
        
    }
    global.EditorModules.push(TextReplacement);
})(this)

