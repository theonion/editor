(function(global) {
    'use strict';
    var Formatting = Formatting || function(editor, options) {
        var self = this;

        editor.on("init", init);

        function init() {
            if (options.settings.visualize) {
                $(options.element)
                    .addClass("visualize");
            }


            // only enable key commands if that kind of markup is allowed in sanitize config. 

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

        function canFormat(tagName) {
            return editor.selection.hasFocus() && 
                options.sanitize.elements.indexOf(tagName) !== -1
        }

        var commands = {
            bold : function() {
                if (canFormat("b")) {
                    global.document.execCommand("bold");
                }
            },
            italic: function() {
                if (canFormat("i")) {
                    global.document.execCommand("italic");
                }
            },
            underline: function() {
                if (canFormat("u")) {
                    global.document.execCommand("underline");
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
                wrap("blockquote")
            },
            visualize: function() {
                editor.updateSetting("visualize", 
                    $(options.element)
                        .toggleClass("visualize")
                        .hasClass("visualize"));
            },

            removeformatting: function() {
                global.document.execCommand("removeformat", false, "");

            }
        }

        function wrap(tagName) {

            // 1. Selection is within a single node, or no selection
            // ---> Wrap element within the tagName
            console.log(tagName);
            console.log(editor.selection.getSelectedBlockNodes());
            var nodes = editor.selection.getSelectedBlockNodes();
            


            // we have a list of nodes. can we wrap them?

        }

        function doList(tagName) {
            console.log(tagName)
            var nodes = editor.selection.getSelectedBlockNodes();
            var nodeNames = nodes.map(function(n) {return n.nodeName})
            console.log(nodeNames);

            /*
            Let's talk about this list of nodes:
                All Lists? Merge 'em & change the list type. 
                All Paragraphs? Turn them all into LIs & wrap 'em w/ the right tagName
                Is there a blockquote or div in the list? ABORT!!!
            */

            if (nodeNames.indexOf("BLOCKQUOTE") !== -1 || nodeNames.indexOf("DIV") !== -1){
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
                    
                    // let's make a fragment to dump all this new shit into.
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

