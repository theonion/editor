/* 

TODO:

    -- -> &mdash;
    ... -> &hellip;
    (c)

    Keep a buffer of recently pressed characters. If a portion of that buffer matches a pattern we've got stored, replace it.

    Keep the cursor in right place & replace the correct characters.

    Step 1: Log the last 5 characters typed in console. 
*/

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

        // editor.on("keydown", function() {setTimeout(replaceText, 10)});
        /*  If the last characters match a string int he map, 
            replace 'em. 
        */
        function replaceText() {
            console.log("replace text");
            var sel = editor.selection.getSelection();
            for (var search in REPLACEMENT_MAP) { 
            
                
                var text = sel.focusNode.textContent.substr(sel.focusOffset-(search.length), search.length);
                console.log("text: ", text);
                if (search === text) {
                    console.log("Search matches string", text, search);
                    var position = sel.focusNode.textContent.lastIndexOf(search);
                    sel.focusNode.textContent = replaceLast(sel.focusNode.textContent, search, REPLACEMENT_MAP[search]);
                    console.log(sel.focusNode);
                    break;
                }
                else {
                    //console.log("Search doesn't match string", text, search);
                }
                
            }

/*
            console.log("logging chars");
            var sel = editor.selection.getSelection();
            console.log("Party: ",  );

            var n = sel.anchorNode;

            n.data = n.substr
*/
        }

        //move this to getSelection
        function _getPrecedingCharacter() {
            var sel = window.getSelection();
            if (sel.focusOffset == 0) {
                return -1
            }
            else {
                return sel.focusNode.textContent.substr(sel.focusOffset-1, 1).charCodeAt(0);
            }
        }

        function replaceQuotes(e) {
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
        editor.on("keydown", replaceQuotes);
    }
    global.EditorModules.push(TextReplacement);
})(this);