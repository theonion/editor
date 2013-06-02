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
    });


    return self;
};

var editor = Editor("editable");
