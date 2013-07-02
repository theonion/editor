


$("#toolbar .screensize").click(function(e) {
    var viewport = $(e.target).data("viewport");
    $("#editor-wrapper").attr("class", viewport);
    $("#toolbar .screensize").removeClass("pressed");
    $("#toolbar .screensize[data-viewport=" + viewport + "]").addClass("pressed");
});
    