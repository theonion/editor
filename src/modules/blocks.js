/*

The editor's main data structure is a list of blocks. 

There are two types of blocks: inline & html


var htmlBlockTags = ["UL", "OL", "P", "BLOCKQUOTE"];
var htmlInlineTags = ['B', 'EM', 'I', 'STRONG', 'U','A', 'BR', 'SUB', 'SUP', 'S'];
*/


(function(global) {
    'use strict';
    var Blocks = Blocks || function(editor, options) {
        var self = this;

        self.tagParsers = {
            'P': paragraphParser,
            'OL': listParser,
            'UL': listParser,
            'BLOCKQUOTE':blockquoteParser,
            'IFRAME':iframeParser,
            'DIV':divParser,
        }

        /* these are defined by outside modules */
        self.inlineParsers = {}


        /* these should be defined externally */
        



        self.loadContent = function(htmlString) {
            htmlString = htmlString.replace(/\n/g, " ");
            var fragment = document.createDocumentFragment();
            fragment.appendChild(document.createElement("div"));
            fragment.childNodes[0].innerHTML = htmlString;

            editor.content.blocks = fragmentToBlocks(fragment.childNodes[0]);
            self.blocksToFragment();
            editor.emit("contentLoaded");
        }

        //converts a fragment of HTML into structured & sanitized blocks. 
        function fragmentToBlocks(domFragment) {
            var blockList = [];
            for (var i = 0; i < domFragment.childNodes.length; i++) {
                var node = domFragment.childNodes[i];
                //assign an ID to the block */
                if (!node.id) {
                    node.id = generateID("block-");
                }
                if (typeof self.tagParsers[node.nodeName] === "function") {
                    var block = self.tagParsers[node.nodeName](node)
                    if (block) {
                        block['id'] = node.id;
                        blockList.push(block);
                    }
                    else {
                        console.log("Failed parsing node into a block: ", node.nodeName, node);
                    }
                }
                else {
                    console.log("unknown node type: ", node.nodeName, node);
                }
            }
            return blockList;
        }

        // returns a dom fragment built 
        self.blocksToFragment = function(blocks) {

            var domFragment = document.createDocumentFragment();
            for (var i = 0; i < editor.content.blocks.length; i++) {
                var block = editor.content.blocks[i];
                if (block.type === "inline") {
                    var html = "";
                }
                else if (block.type === "html") {

                    //create an element
                    var node = document.createElement(block.tagName);
                    node.innerHTML = block.contents;
                    var html = "";
                }

                $(".editor", editor.options).append(html);


            }
        }


        function generateID(prefix) {
            //TODO: check if ID already exists in blocks to prevent collisions
            return prefix + Math.random().toString(16).substr(2);
        }





        /* Tag Parsers */
        function paragraphParser(node) {
             var content =  editor.sanitize.clean_node(node);
             return {type:"html", tag:"P", content: content}; //a block in the right format
        }

        function listParser(node) {
            var content = [];
            for (var j = 0; j < node.childNodes.length; j++) {
                if (node.childNodes[j].nodeType === 1 && node.childNodes[j].nodeName === "LI") {
                    content.push(editor.sanitize.clean_node(node.childNodes[j]));
                }
            }            
            return {type:"html", tagName:node.nodeName, content: content}
        }

        function iframeParser(node) {

            //wrap in embed div?
        }

        function divParser(node) {
            //one of our inline objects that has a type specified

            var content = {};
            if (node.getAttribute("data-type")) {
                //throw all data attributes into content.

                if (typeof self.inlineParsers[node.getAttribute("data-type")] === "function") {
                    content = self.inlineParsers[node.getAttribute("data-type")](node);
                }

                for (var i=0; i < node.attributes.length; i++){
                    var name = node.attributes[i].nodeName;
                    if (name.indexOf("data-") === 0) {
                        content[name.replace("data-", "")] = node.attributes[i].nodeValue;
                    }
                }
                return {type:"inline", content: content}
            }
            else { //it could just be a paragraph. Let's parse it as such. 
                return paragraphParser(node);
            }
        }

        function blockquoteParser(node) {
            /* grab all immediate children */ 

            //list of dom fragments?
        }



        editor.blocks = self;
        

    }
    global.EditorModules.push(Blocks);
})(this);