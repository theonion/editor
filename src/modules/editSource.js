/*
    Need a way to edit the source directly

    I want this to go away eventually, but I think we need it now.

*/

(function(global) {
    'use strict';
    var EditSource = EditSource || function(editor, options) {
        var self = this;

        var template =
        '<div id="edit-source" class="modal in">\
            <div class="modal-dialog">\
                <div class="modal-content">\
                    <div class="modal-header">\
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\
                        <h4 class="modal-title">Edit Raw HTML</h4></div>\
                    <div class="modal-body"><textarea></textarea></div>\
                    <div class="modal-footer">\
                        <button class="btn btn-link" id="edit-source-cancel">Cancel</button>\
                        <button class="btn btn-primary" id="edit-source-update">Update</button>\
                    </div>\
                </div>\
            </div>\
        </div>';

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
            if ($("#edit-source").length === 0) {
                $("body").append(template);

                $("#edit-source textarea")
                    .val( editor.getContent() );
                $("#edit-source-cancel").click(function() {
                    $("#edit-source").remove();
                });
                $("#edit-source").show();
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