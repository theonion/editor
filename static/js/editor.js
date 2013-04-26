    /*
        Let's do this. This editor takes advantage of HTML5's contenteditable and makes no effort
        to work in browsers that don't support this.

        The underlying storgage mechanism of the content is markdown.

        For writers to work in straight markdown will clutter the workspace with links images, etc, making writing distracting.

        The difficult part will be to ensure the HTML 


    */


    var Editor = function(id) {
        self = {};


        var editarea = $("#" + id);
        

        /* Load Data */
        contentID  = editarea.data("content-id");
        var saveStatus = "saved";

        if (contentID) {
            $.ajax({
                url: "/doc/" + contentID + ".json",
                dataType: "json",
                success: function(data) {
                    $(".title").html(data.title);
                    editarea.html(data.content);
                },
                error: function() {
                    console.log("ajax call crapped out");
                }
            });
        }
        else {
            contentID = prompt("Enter a slug");
        }

        
        /*  key bindings. These are global to anything contentEditable=true, 
            because of the nature of document.execCommand. May need to ensure they happen
            in the context of the instance so weird things don't happen
            */
        key('⌘+b, ctrl+b', _bold);
        key('⌘+i, ctrl+i', _italic);
        key('⌘+u, ctrl+u', _underline);




        $("#toolbar .icon-bold").click(_bold);
        $("#toolbar .icon-italic").click(_italic);
        $("#toolbar .icon-underline").click(_underline);
        $("#toolbar .icon-link").click(_link);
        // $("#toolbar .icon-quote-left").click(_blockquote);
        $("#toolbar .icon-undo").click(_undo);
        $("#toolbar .icon-redo").click(_redo);
        


        /* IN */

        $(window).bind("scroll", function() {

            if (window.scrollY > $(".title").outerHeight()) {
                $("body").addClass("fixed");
            }
            else {
                $("body").removeClass("fixed");
            }
        });


        //handle focus stuff.
        editarea.bind("keyup mousedown", function() {
            setTimeout(function() {
                var sel = window.getSelection();
                if (sel) {
                    range = sel.getRangeAt(0);
                    node = range.commonAncestorContainer.parentNode;
                    $(".editor>div,.editor>p").removeClass("focus");
                    
                    if ($(node).is(".editor>div,.editor>p")) {
                        $(node).addClass("focus");
                    }
                    else {
                        $(node).parents(".editor>div,.editor>p").addClass("focus");
                    }
                    // get list of parents
                    self.currentNode = node;
                    var parents = $(range.commonAncestorContainer).parents();
                    //set button states
                    $("#toolbar button").removeClass("pressed");
                    for (var i=0; i<parents.length; i++) {
                        $("button[data-nodetype=" + parents[i].nodeName +"]").addClass("pressed");

                    }
                }
            }, 20)

        });

        //character replacement business
        editarea.bind("keydown", function(e) {
            if (e.keyCode == 222) { //either a single quote or double quote was pressed                
                if (e.shiftKey)
                    undoChr = "&quote;";
                else
                    undoChr = "'";
                console.log(_getPreedingCharacter());
                switch (_getPreedingCharacter()) {
                    case -1:
                    case 32:
                    case 160: //space & nbsp;
                        if (e.shiftKey) 
                            chr = "&ldquo;";
                        else
                            chr = "&lsquo;";
                        console.log("space");
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
        });

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

        var autosaveTimeout;
        editarea.bind("keyup", function(e) {
            sel = window.getSelection();
            range = sel.getRangeAt(0);
            clearTimeout(autosaveTimeout);
            autosaveTimeout = setTimeout(autosave, 5000);

            //if a quote is pressed, wait until 3 more characters are typed to determine proper curliness
            


        });

        editarea.bind("paste", function(e) {
            var text = e.originalEvent.clipboardData.getData('text/plain');
            if (window.getSelection) {
                sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    range.deleteContents(); 
                    //range.insertNode( document.createTextNode(text) );
                    document.execCommand("InsertHTML", false, text);
                }
            }
            e.preventDefault();
            clearTimeout(autosaveTimeout);
            autosaveTimeout = setTimeout(autosave, 5000);
        });


        function _cleanUpHTML() {
            //replace <div> with <p>


        }

        /* Editing commands */
        function _bold() {
            document.execCommand("BOLD");
        }

        function _italic() {
            document.execCommand("ITALIC");
        }

        function _underline(){ 
            document.execCommand("UNDERLINE");
        }
        function _blockquote() {
            document.execCommand("FORMATBLOCK", null, "<blockquote>");
        }
        function _undo(){ 
            document.execCommand("UNDO");
        }

        function _redo(){ 
            document.execCommand("REDO");
        }
        function _link() {
            url = prompt("URL:");
            if (url) {
                document.execCommand("createLink", true, url);
            }
        }

        function autosave() {
            //dump copy in localstorage
            if (saveStatus != "pending")   {
                _setAutoSaveStatus("saving");
                saveStatus = "pending";

                $.ajax({
                    url: '/save',
                    type: 'POST',
                    dataType: 'json',
                    data: 'content=' + escape(editarea.html()),
                    success: function(data) {
                        console.log("SAVED");
                        _setAutoSaveStatus("ok");
                        saveStatus = "saved";
                    },
                    error: function(err) {
                        _setAutoSaveStatus("offline");
                        saveStatus = "offline"; 
                        autosaveTimeout = setTimeout(autosave, 5000); // try again
                    }
                })
            }

        }
        function _setAutoSaveStatus(status, message) {
            var icon = $("#autosave-icon").attr("class", "");
            var message = $("#autosave-message");
            switch(status) {
                case "ok":
                    icon.addClass("icon-ok");
                    message.html("All changes saved");
                    break;
                case "unsaved": 
                    icon.addClass("icon-save");
                    break;
                case "saving":
                    icon.addClass("icon-refresh icon-spin");
                    message.html("Saving");
                    break;
                case "offline":
                    icon.addClass("icon-warning-sign")
                    message.html("Saved locally. Reconnect to save to server.");
                    break;

            }  
        }
        self.status = _setAutoSaveStatus;
        

        function _stats() {
            var text = $(editor)[0].innerText;
            wordcount = rawtext.split(/\s+/).length;
            return {
                wordcount: wordcount,
                characters: text.length,
                readingtime: wordcount / 225

            }

        }
        //udpate buttons based on cursor position
        function _onCursorUpdate()
        {
            //walk up to parent 
        }

        return self;
    };


    var editor = Editor("editable");