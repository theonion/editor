/* 
    Basecamp style autosave. 

    Dumps body into localstorage after the dom changes.
*/
(function(global) {
    'use strict';
    var Persist = Persist || function(editor, options) {
        var self = this;

        //editor.on("domchange", )

        editor.embed = {types: []};
    }
    global.EditorModules.push(Persist);
})(this)