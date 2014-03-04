/*
    Find & Replace

    - Must be initialized separately. Works across multiple instances.

    - This has nothing really to do with the Editor itself and can work on any
    page with contentEditable regions

    Uses Rangy's textrange. Only available in Rangy 1.3

    http://rangy.googlecode.com/svn/trunk/demos/textrange.html
*/

(function(global) {
    'use strict';
    var FindReplace = FindReplace || function() {
        rangy.init(); //TODO: initialize this code after rangy already initiazlizes itself
        var self = this;

        var contextRange, //the range to do the search/replace in. 
            searchResultApplier,
            dialog,
            findBox,
            replaceBox;


        var searchOptions = {
            caseSensitive: true,
            wholeWordsOnly: false
        };

        function init() {

            if ($().length === 0) {
                var html = $("#find-replace-template").html();
                $("body").append(html);

                dialog = $(".find-replace-dialog");
                findBox = $(".editor-find", dialog);
                replaceBox = $(".editor-replace", dialog);

                $(".close", dialog).click(hideDialog);

                //update highlighting when typing. 
                findBox.bind("keyup", find);
                $(".replace-all", dialog).click(replaceAll);
            }
            key('⌘+f, ctrl+f', showDialog);
            window.contextRange = contextRange;
        }

        function destroy() {
            key.unbind('⌘+f, ctrl+f');
        }

        function showDialog(e) {
            e.preventDefault();
            searchResultApplier = rangy.createClassApplier("searchResult");
                        
            // is there a selection? set the search value to it
            var range = rangy.getSelection();
            if (!range.collapsed && range.rangeCount > 0) {
                findBox.val(range.toString());
            }
            else {
                findBox.val("");   
            }
            replaceBox.val("");

            dialog.show();
            findBox.focus();
            setTimeout(find, 200);
        }

        function isContentEditable(el) {
            // Contenteditable=false can be contained inside a contenteditable=true
            if ($(el).parents("[contenteditable='false']").length > 0) {
                return false;
            }
            else if ($(el).parents("[contenteditable='true']").length > 0)  {
                return true;
            }
            return false;
        }

        function find() {
            var search = findBox.val();
            
            var searchScopeRange = rangy.createRange();
            searchScopeRange.selectNodeContents(document.body);    
            searchOptions.withinRange = searchScopeRange;

            var searchRange = rangy.createRange();
            searchRange.selectNodeContents(document.body);
            searchResultApplier.undoToRange(searchRange);

            setTimeout(function() {
                if (search.length > 0) {
                    while (searchRange.findText(search, searchOptions)) { // range now encompasses the first text match
                        // check to see if the range is contentEditable before applying the class
                        if (isContentEditable(searchRange.startContainer)) {
                            searchResultApplier.applyToRange(searchRange);
                        }
                        
                        // Collapse the range to the position immediately after the match
                        searchRange.collapse(false);
                    }
                }
            }, 50);
        }


        function replace() {
            var results = $(".searchResult");
            for (var i=0;i<results.length;i++) {
                if (isContentEditable(results[i])) {
                    $(results[i]).html(replaceBox.val());
                }
            }
            hideDialog();
        }

        function replaceAll() {
            var results = $(".searchResult");
            for (var i=0;i<results.length;i++) {
                if (isContentEditable(results[i])) {
                    $(results[i]).html(replaceBox.val());
                }
            }
            hideDialog();
        }

        function hideDialog() {
            var range = rangy.createRange();
            range.selectNodeContents(document.body);
            searchResultApplier.undoToRange(range);
            dialog.hide();
        }

        function findNext() {
            //withinRange

        }
        $(document).ready(init);
    }
    global.FindReplace = FindReplace;
    return self;
})(this);

