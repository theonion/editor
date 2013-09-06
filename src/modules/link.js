/*  
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
*/