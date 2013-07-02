(function(global) {
    'use strict';
    var InlineObject = Toolbar || function(editor, options) {
        var self = this;

        editor.on("init", function() {
            console.log("Toolbar Init");   
        });
        
        console.log("Calling init for Toolbar");
    }
    global.EditorModules.push(Toolbar);
})(this)



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
        alert("Inline media set up window will pop up in a modal, maybe");
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



/*
        <div id="media-templates" style="display:none">
            <div class="inline image full template">
                <img src="http://placehold.it/870x300/C0392B/F39C12">
                <span class="caption">A delightful image</span>
            </div>
            <div class="inline image left template">
                <img src="http://placehold.it/400x300/C0392B/F39C12">
                <span class="caption">A delightful image</span>
            </div>
            <div class="inline image right template">
                <img src="http://placehold.it/400x300/C0392B/F39C12">
                <span class="caption">A delightful image</span>
            </div>
            <div class="inline image centered template">
                <img src="http://placehold.it/670x300/C0392B/F39C12">
                <span class="caption">A delightful image</span>
            </div>

            <div class="inline audio right template" >
                <img src="http://placehold.it/180x180/0E7AC3/ffffff">
                <span class="caption">A pleasant song</span>
            </div>
            <div class="inline audio left template" >
                <img src="http://placehold.it/180x180/0E7AC3/ffffff">
                <span class="caption">A pleasant song</span>
            </div>

            <div class="inline left video template">
                <img src="http://placehold.it/240x135/27AE60/ffffff">
                <span class="caption">An enjoyable video</span>
            </div>
            <div class="inline right video template">
                <img src="http://placehold.it/240x135/27AE60/ffffff">
                <span class="caption">An enjoyable video</span>
            </div>
            <div class="inline centered video template">
                <img src="http://placehold.it/640x360/27AE60/ffffff">
                <span class="caption">An enjoyable video</span>
            </div>

            <div class="inline left code template">


            </div>

        </div>
*/