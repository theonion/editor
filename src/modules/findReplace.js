/*
    Find & Replace

*/

(function(global) {
    'use strict';
    var FindReplace = FindReplace || function(editor, options) {
        var self = this;
        editor.on("init", init);
        editor.on("destroy", destroy);
        

        function init() {
            key('⌘+f, ctrl+f', find);

            if ($(".find-replace-dialog").length === 0) {
                var html = $("#find-replace-template").html();
                $("body").append(html);
            }
            self.dialog = $(".find-replace-dialog");
        }

        function destroy() {
            key.unbind('⌘+f, ctrl+f');
        }


        function find(e) {
            if (editor.selection.hasFocus()) {
                self.dialog.show();
                console.log("search dialog");
                e.preventDefault();
            }
        }
    }
    global.EditorModules.push(FindReplace);
})(this)

