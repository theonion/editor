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
                $(".editor>div,.editor>p").eq(0).addClass("focus");
                /* disable contenteditalbe on inline items */
                $(".inline").attr("contenteditable", "false");
            },
            error: function() {
                console.log("ajax call crapped out");
            }
        });
    }
    else {
        contentID = prompt("Enter a slug");
    }
    
    key('⌘+b, ctrl+b', _bold);
    key('⌘+i, ctrl+i', _italic);
    key('⌘+u, ctrl+u', _underline);

    $("#toolbar .icon-bold").click(_bold);
    $("#toolbar .icon-italic").click(_italic);
    $("#toolbar .icon-underline").click(_underline);
    $("#toolbar .icon-strikethrough").click(_strikethrough);

    $("#toolbar .icon-link").click(_link);
    // $("#toolbar .icon-quote-left").click(_blockquote);
    $("#toolbar .icon-undo").click(_undo);
    $("#toolbar .icon-redo").click(_redo);
    
    $(".insertable").bind("mouseover", function(e) {
        var type = $(e.target).data("type")
        var template = $("#media-templates " + type)[0].outerHTML;
        $(".focus").before(template);
    });

    $(".insertable").bind("mouseout", function() {
        $("#" + id + " .template").remove();
    });

    $(".insertable").click(function(e) {
        $("#" + id + " .template").removeClass("template");
    });

    var _inlinePositionY;
    editarea.bind("mouseover", function (e) {
        var el = $(e.target).parents(".inline")
        if (el.length == 1) {
            _inlinetoolsShow(el) 
        }
        else {
            $("#inline-tools").hide();
            $(".inline.editing").removeClass("editing");
        }
    });

    $("#inline-up").click(_inlineMoveUp);
    $("#inline-down").click(_inlineMoveDown);

    $("#inline-edit").click(_inlineEdit);
    $("#inline-remove").click(_inlineRemove);

    function _inlineMoveUp(e) {
        tmp = _inlinePositionY;
        $(".editing").after($(".editing").prev())
        _inlinetoolsShow($(".editing"))
        window.scrollBy(0, _inlinePositionY - tmp)
    }
    function _inlineMoveDown(e) {
        tmp = _inlinePositionY;
        $(".editing").before($(".editing").next())
        _inlinetoolsShow($(".editing"))
        window.scrollBy(0,_inlinePositionY - tmp)
    }
    
    function _inlineRemove(e) {
        if (confirm("You sure?")) {
            $(".editing").remove();
        }
    }

    function _inlineEdit(e) {

    }

    function _inlinetoolsShow(inlineElement) {
        el = $(inlineElement[0])
        var pos  = el.offset();
        _inlinePositionY = pos.top;
        el.addClass("editing");
        $("#inline-tools")
            .css(pos)
            .show();
    }

    $(window).bind("scroll", function() {
        if (window.scrollY > $(".title").outerHeight())
            $("body").addClass("fixed");
        else
            $("body").removeClass("fixed");
    });

    //handle focus stuff.
    editarea.bind("keyup mousedown", function() {
        setTimeout(function() {
            var sel = window.getSelection();
            if (sel && sel.type != "None" ) {
                range = sel.getRangeAt(0);
                node = range.commonAncestorContainer.parentNode;
                $(".editor>div,.editor>p").removeClass("focus");
                
                if ($(node).is(".editor>div,.editor>p")) {
                    $(node).addClass("focus");
                }
                else {
                    $(node).parents(".editor>div,.editor>p").addClass("focus");
                }
                //move the little focus indicator 
                if ($(".focus").length > 0)
                    $("#focus-cursor").css({top:$(".focus").position().top+5}).show();

                //hide link editor 
                $(".url-editing").removeClass("url-editing");
                $("#url-input").hide();

                $("#toolbar button.textstyle").removeClass("pressed");

                //set button states
                var parents = $(range.commonAncestorContainer).parents();
                for (var i=0; i<parents.length; i++) {
                    $("button.textstyle[data-nodetype=" + parents[i].nodeName +"]").addClass("pressed");
                    if (parents[i].nodeName == "A")
                        _editLink(parents[i]);
                }
            }
        }, 20)

    });

    //character replacement business
    editarea.bind("keydown", function(e) {
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
    });

    function _editLink(linkNode) {
        if (linkNode) {
            //position over url;
            var position = $(linkNode).position();
            var width = $(linkNode).width();
            var url = linkNode.href
            if (url.indexOf("replaceme") > 0)
                url = "";
            $(linkNode).addClass("url-editing");
            $("#url-input>textarea")
                .unbind()
                .val(url)
                .bind("change", function(e) {
                    linkNode.href= $(this).val()
                })
            $("#url-input")
                .css({top: position.top-60, left: 100})
                .show();
        }
    }
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
        
        if (sel && sel.type != "None") {
            range = sel.getRangeAt(0);
            clearTimeout(autosaveTimeout);
            autosaveTimeout = setTimeout(autosave, 5000);
        }
    });

    editarea.bind("paste", function(e) {
        var text = e.originalEvent.clipboardData.getData('text/plain');
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents(); 
                document.execCommand("InsertHTML", false, text);
            }
        }
        e.preventDefault();
        clearTimeout(autosaveTimeout);
        autosaveTimeout = setTimeout(autosave, 5000);
    });

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
    function _strikethrough() {
        document.execCommand("STRIKETHROUGH");
    }
    function _blockquote() {
        document.execCommand("FORMATBLOCK", false, "<blockquote>");
    }
    function _undo(){ 
        document.execCommand("UNDO");
    }
    function _redo(){ 
        document.execCommand("REDO");
    }
    function _link() {
        if (document.execCommand("createLink", true, "#replaceme")) {
            sel = window.getSelection();
            range = sel.getRangeAt(0);
            _editLink(range.commonAncestorContainer.parentElement);    
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
                data: 'slug=' + contentID + '&content=' + escape(editarea.html()),
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

    function _stats() {
        var text = $(editor)[0].innerText;
        wordcount = rawtext.split(/\s+/).length;
        return {
            wordcount: wordcount,
            characters: text.length,
            readingtime: wordcount / 225
        }
    }
    return self;
};

var editor = Editor("editable");