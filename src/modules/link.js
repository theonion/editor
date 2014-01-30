/* 

TODO: Clean up showing/hiding stuff. 

*/

(function(global) {
    'use strict';
    var Link = Link || function(editor, options) {
        var self = this;
        editor.on("init", init);
        editor.on("destroy", destroy);
        

        var activeLinkElement; 

        function init() {
            key('⌘+k, ctrl+k', makeLink);
            editor.on("toolbar:click", function(name) {
                if (name === "link") 
                    makeLink();
            })
            
            //register dialog events:
            $(".editor", options.element).click( function(e) {
                var link = $(e.target).closest("A");
                if (link.length === 1) {
                    //Show link info
                    activeLinkElement = link[0];
                    showViewLinkDialog();
                }
                else {
                    //HIDE 
                    $(".link-tools", options.element).hide();                       
                }
            });

            $(".link-change", options.element).click(showEditLinkDialog);
            $(".link-remove", options.element).click(removeLink);
            $(".link-apply", options.element).click(applyLinkEdits);
        }

        function destroy() {
            key.unbind('⌘+k, ctrl+k');
        }

        function removeLink() {
            activeLinkElement.outerHTML = activeLinkElement.innerHTML;
            $(".link-tools", options.element).hide();
        }


        function setURL() {
            var url = $(activeLinkElement).attr("href");
            $(".link-url", options.element).html(url);
            $(".link-url", options.element).attr("href", url);

            if (url !== "#") {
                $(".link-input-textbox", options.element).val(url);
            }
            else {
                $(".link-input-textbox", options.element).val("");
            }
        }

        function positionDialog() {
            var pos = editor.selection.getCoordinates();
            $(".link-tools", options.element).css({top: pos.top + 20, left: pos.left})

        }
        function showViewLinkDialog() {
            //shows the url, change & remove buttons
            //only shows up on click
            setURL();
            positionDialog();
            $(".link-tools", options.element).show();
            $(".link-edit-dialog", options.element).hide();
            $(".link-view-dialog", options.element).show();
        }

        function showEditLinkDialog() {
            positionDialog();
            $(".link-tools", options.element).show();
            $(".link-edit-dialog", options.element).show();
            $(".link-view-dialog", options.element).hide();
            $(".link-input-textbox", options.element).focus();

        }
        function canDoLink() {
            return options.sanitize.elements.indexOf("a") !== -1;
        }

        function makeLink() {
            //make a link, then throw open the edit dialog.
            if (editor.selection.hasSelection() && canDoLink() ) {
                global.document.execCommand("CREATELINK", false, "#");
                activeLinkElement = rangy.getSelection().anchorNode.parentNode;
                setTimeout(function() {
                    setURL();
                    showEditLinkDialog();
                }, 5);
            }
        }
        function applyLinkEdits() {
            activeLinkElement.setAttribute("href", $(".link-input-textbox", options.element).val())
            $(".link-tools", options.element).hide();
        }



    }
    global.EditorModules.push(Link);
})(this);