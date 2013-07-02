
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