/* TODO: 
    Can't CMD+B in Safari

*/

    (function(global) {
    'use strict';
    var Formatting = Formatting || function(editor, options) {
        var self = this;

        editor.on("init", init);
        editor.on("destroy", destroy);

        function init() {
            key('⌘+b, ctrl+b', commands["bold"]);
            key('⌘+i, ctrl+i', commands["italic"]);
            key('⌘+u, ctrl+u', commands["underline"]);

            editor.on("toolbar:click", function(name) {
                if (typeof commands[name] === "function" ) {
                    if (editor.selection.hasFocus()) {
                        commands[name]();
                    }
                }
            })
        }
        
        function destroy() {
            key.unbind('⌘+b, ctrl+b');
            key.unbind('⌘+i, ctrl+i');
            key.unbind('⌘+u, ctrl+u');
        }

        function canFormat(tagName) {
            return editor.selection.hasFocus() && 
                options.sanitize.elements.indexOf(tagName) !== -1
        }

        var commands = {
            bold : function(e) {
                if (canFormat("b")) {
                    global.document.execCommand("bold");
                    e.preventDefault();
                }
            },
            italic: function(e) {
                if (canFormat("i")) {
                    global.document.execCommand("italic");
                    e.preventDefault();
                }
            },
            underline: function(e) {
                if (canFormat("u")) {
                    global.document.execCommand("underline");
                    e.preventDefault();
                }
            },
            strikethrough: function() {
                if (canFormat("s")) {
                    global.document.execCommand("strikethrough");
                }
            },
            superscript: function() {
                if (canFormat("sup")) {
                    global.document.execCommand("superscript");
                }
            },
            subscript: function() {
                if (canFormat("sub")) {
                    global.document.execCommand("subscript");
                }
            },
            /* structural formatting */
            unorderedlist: function() {
                doList("UL")
            },
            orderedlist: function() {
                doList("OL")
            },
            blockquote: function() {
                wrap("BLOCKQUOTE", false)
            },
            visualize: function() {
                $(options.element)
                    .toggleClass("visualize");
            },
            removeformatting: function() {
                global.document.execCommand("removeformat", false, "");
            }
        }


        function wrap(tagName, allowNesting) {
            tagName = tagName.toUpperCase();
            // 1. Selection is within a single node, or no selection
            // ---> Wrap element within the tagName
            console.log(tagName);
            console.log(editor.selection.getSelectedBlockNodes());
            var nodes = editor.selection.getSelectedBlockNodes();
            var nodeNames = nodes.map(function(n) {return n.nodeName})
            // we have a list of nodes. can we wrap them?

            if (nodeNames.indexOf("BLOCKQUOTE") !== -1 || nodeNames.indexOf("DIV") !== -1){
                console.log("Selection contains blockquote or div. Abort!")
            }
            else {
                var parentNodeNames = nodes.map(function(n) {return n.parentNode.nodeName})

                //check to see if the thing you're trying to wrap with doesn't already exist in the list of nodes
                if (parentNodeNames.indexOf(tagName) !== -1) {
                    var parent = nodes[0].parentNode;
                    $(parent).after($(parent).html())
                    editor.selection.selectNode($(parent).next());
                    $(parent).remove();
                }
                else {
                    var prevNode = $(nodes[0]).prev();
                    var parentNode = $(nodes[0]).parent();                    
                    var frag = document.createDocumentFragment();
                    
                    frag.appendChild(document.createElement(tagName));
                    for (var i = 0; i < nodes.length; i++) {
                        //throw paragraph innerhtml in a list
                        var newNode = document.createElement(nodes[i].nodeName);
                        newNode.innerHTML = nodes[i].innerHTML;
                        frag.childNodes[0].appendChild( newNode );
                    }
                    //remove existing nodes.
                    //find the right place to insert
                    $(nodes).remove();
                    if (prevNode.length !== 0) {
                        $(prevNode).after(frag.firstChild)
                        editor.selection.selectNode($(prevNode).next());
                    }
                    else {
                        $(parentNode).prepend(frag.firstChild);
                        editor.selection.selectNode(parentNode[0].firstChild);
                    }                    
                }
            }
        }

        function canDoList() {

            //use this in doList, also use this when to show whether or not a button can be clicked
            if (nodeNames.indexOf("BLOCKQUOTE") !== -1 || nodeNames.indexOf("DIV") !== -1) {

            }

            //Not sure how to have these modules provide actual feedback to the toolbar to give the user a hint that a button can't be pushed. 
            /* Options: 
                1) put names of "action validators" in the markup. call these on hover.
                2) 

            */
        }

        function doList(tagName) {
            var nodes = editor.selection.getSelectedBlockNodes();
            var nodeNames = nodes.map(function(n) {return n.nodeName})

            /*
            Let's talk about this list of nodes:
                All Lists? Merge 'em & change the list type. 
                All Paragraphs? Turn them all into LIs & wrap 'em w/ the right tagName
                Is there a blockquote or div in the list? ABORT!!!
            */

            // TODO: Move this out, so you can have the buttons indicate wheter the list action is 
            if (nodeNames.indexOf("BLOCKQUOTE") !== -1 || nodeNames.indexOf("DIV") !== -1) {
                console.log("Selection contains blockquote or div. Abort!")
            }
            else {
                // if there's only one node selected & it is a list of the same type as the one selected, convert to paragraphs
                if (nodes.length == 1 && nodes[0].nodeName == tagName) {
                    var html = "";
                    var items = $("li", nodes[0]);
                    items.map(function(i) {  html += "<p class='tmp-selectme'>" + $(items[i]).html() + "</p>";})
                    $(nodes[0])[0].outerHTML = html;
                    //TODO: select newly inserted paragraphs
                    //the only thing that matter are the first & last nodes. probably should do that instead. 
                    editor.selection.selectNodes($(".tmp-selectme"));
                    $(".tmp-selectme").removeClass("tmp-selectme");
                }
                else {
                    //we should only have existing UL/OL and paragraphs now, all with the same parent
                    var newListItems = []
                    for (var i = 0; i < nodes.length; i++) {
                        //get list of html fragments to encase in LIs
                        if (nodes[i].nodeName === "OL" || nodes[i].nodeName === "UL") {
                            //throw all the li innerhtml into a list
                            var listItems = $.makeArray( $("li", nodes[i]) );
                            listItems.map(function(el) { newListItems.push($(el).html()) });
                        }
                        else {
                            //throw paragraph innerhtml in a list
                            newListItems.push( nodes[i].innerHTML )
                        }
                    }
                    /*iterarte over nodelist, wrap html in the list with an LI, append to
                    list inside fragment
                    */
                    var frag = document.createDocumentFragment();
                    frag.appendChild(document.createElement(tagName));
                    for (var i = 0; i< newListItems.length; i++) {
                        var li = document.createElement("LI");
                        li.innerHTML = newListItems[i]
                        frag.childNodes[0].appendChild( li );
                    }
                    //find the right place to insert
                    var prevNode = $(nodes[0]).prev();
                    var parentNode = $(nodes[0]).parent();
                    $(nodes).remove();
                    if (prevNode.length !== 0) {
                        $(prevNode).after(frag.firstChild)
                        editor.selection.selectNode($(prevNode).next());
                    }
                    else {
                        $(parentNode).prepend(frag.firstChild);
                        editor.selection.selectNode(parentNode[0].firstChild);
                    }
                }
            }
        }
    }
    global.EditorModules.push(Formatting);
})(this)