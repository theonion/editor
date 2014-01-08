/*
    Need a way to edit the source directly

    I want this to go away eventually, but I think we need it now.

*/

(function(global) {
    'use strict';
    var EditSource = EditSource || function(editor, options) {
        var self = this;

        var template =
        '<div id="edit-source">\
            <textarea></textarea>\
            <button id="edit-source-update">Update</button>\
            <button id="edit-source-cancel">Cancel</button>\
        </div>'

        editor.on("init", init);
        editor.on("destroy", destroy);

        function init() {
            if (options.editSource === true) {
               key('⌘+., ctrl+.', editSource);
            }
        }

        function destroy() {
            key.unbind('⌘+., ctrl+.');
        }

        function editSource() {
            //alert(editor.getContent());
            if ($("#edit-source").length === 0) {
                $("body").append(template);
                $("#edit-source textarea")
                    .val( editor.getContent() );
                $("#edit-source-cancel").click(function() {
                    $("#edit-source").remove();
                });
                $("#edit-source-update").click(function() {
                    editor.setContent(
                        $("#edit-source textarea").val()
                    );
                    $("#edit-source").remove();
                });
            }
        }
    }
    global.EditorModules.push(EditSource);
})(this);