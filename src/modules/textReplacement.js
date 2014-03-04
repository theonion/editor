(function(global) {
    'use strict';
    var TextReplacement = TextReplacement || function(editor, options) {
        var self = this;

        function replaceLast(str, find, replace) {
            var index = str.lastIndexOf(find);
            if (index >= 0) {
                return str.substring(0, index) + replace + str.substring(index + find.length);
            }
            return str.toString();
        }

        //add this to config
        var REPLACEMENT_MAP = {
            "...": "…",
            "--": "—",
            "(c)": "©"
        }

        editor.on("keydown", function() {setTimeout(replaceText, 10)});
        /*  If the last characters match a string int he map, 
            replace 'em. 
        */
        function replaceText() {
            
            var sel = rangy.getSelection();
            for (var search in REPLACEMENT_MAP) { 
                
                var node = sel.focusNode;
                var offset = sel.focusOffset;
                var text = getPrecedingCharacters(search.length);
                
                if (search === text) {

                    /* create a new selection from the offset - search length to offset */
                    var newRange = rangy.createRange()
                    newRange.setStart(node, offset - search.length);
                    newRange.setEnd(node, offset);
                    newRange.deleteContents();

                    document.execCommand("InsertHTML", false, REPLACEMENT_MAP[search]);

                    break;
                }                
            }
        }

        //move this to getSelection
        function getPrecedingCharacters(number) {
            var sel = rangy.getSelection();
            if (sel.focusOffset == 0) {
                return "";
            }
            else {
                return sel.focusNode.textContent.substr(sel.focusOffset - number, number);
            }
        }

        function replaceQuotes(e) {
            if (e.keyCode == 222) { //either a single quote or double quote was pressed                
                var p = getPrecedingCharacters(1);

                if (p === "") {
                    var charCode = -1;
                }
                else {
                    var charCode  = p.charCodeAt(0);
                }
                var chr;
                switch (charCode) {
                    //double quote
                    case 8220:
                        if (e.shiftKey) 
                            chr = "&rdquo;";
                        else
                            chr = "&lsquo;";
                    break;
                    //single quote
                    case 8216: 
                        if (e.shiftKey) 
                            chr = "&ldquo;";
                        else
                            chr = "&rsquo;";
                    break;
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
        editor.on("keydown", replaceQuotes);
    }
    global.EditorModules.push(TextReplacement);
})(this)
