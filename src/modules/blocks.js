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
            'P': parseParagraph,
            'OL': parseList,
            'UL': parseList,
            'BLOCKQUOTE':parseBlockquote,
            'IFRAME':parseIframe,
            'DIV':parseDiv,
        }


        self.tagRenderers = {
            'P': renderParagraph,
            'OL': renderList,
            'UL': renderList,
            'LI': renderListItem,
            'BLOCKQUOTE':renderBlockquote,
            'IFRAME':renderIframe,
            /*'DIV':renderDiv (there should be no freestanding divs in the json) */
        }


        /* these are defined by outside modules */
        self.inlineObjectParsers = {};

        /* for extra pre-processing in block content data, if needed */
        self.inlineObjectRenderers = {}


        /* these should be defined externally */
        
        function domFragmentToHTML(fragment) {
            var html = "";
            for (var i=0; i < fragment.childNodes.length; i++) {
                if (fragment.childNodes[i].nodeType === 3) {
                    html += fragment.childNodes[i].textContent;
                }
                else {
                    html += fragment.childNodes[i].outerHTML;
                }
            }
            return html
        }

        
        self.removeBlock = function(id) {

        }
        
        self.swapBlocks = function(id1, id2) {

        }

        self.splitBlock = function(id1, id2, atNode, atOffset) {

        }


        self.loadContent = function(htmlString) {
            htmlString = htmlString.replace(/\n/g, " ");
            var fragment = document.createDocumentFragment();
            fragment.appendChild(document.createElement("div"));
            fragment.childNodes[0].innerHTML = htmlString;

            editor.content.blocks = fragmentToBlocks(fragment.childNodes[0]);

            var parsedFragment = blocksToFragment(editor.content.blocks);
            
            $(".editor", options.element).html(parsedFragment);
            $(".inline", options.element).attr("contenteditable", "false");
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
                   // console.log("unknown node type: ", node.nodeName, node);
                }
            }
            return blockList;
        }

        // returns a dom fragment built 
        function blocksToFragment(blockList) {

            var domFragment = document.createDocumentFragment();
            for (var i = 0; i < blockList.length; i++) {
                var block = blockList[i];
                if (block.type === "inline") {
                    if (options.inline[block.content.type]) {
                        //merge defaults w/ values.
                        var values = $.extend(block.content, options.inline[block.content.type].defaults);
                        if (typeof self.inlineObjectRenderers["block.content.type"] === "function") {
                            values = $.extend(values, self.inlineObjectRenderers["block.content.type"](block));
                        }
                        var html = editor.utils.template(options.inline[block.content.type].template, values);
                        domFragment.appendChild($(html)[0]);
                    }
                    else {
                        console.log("Not a valid inline block content type", block.content.type);
                    }
                }
                else if (block.type === "html") {
                    //create an element
                    var node = document.createElement(block.tagName);
                    node.id = block.id;
                    node.innerHTML = self.tagRenderers[block.tagName](block);
                    domFragment.appendChild(node);
                }
            }
            return domFragment;
        }


        function generateID(prefix) {
            var id = prefix + Math.random().toString(16).substr(2);
            //TODO: check if ID already exists in blocks to prevent collisions
            return id;
        }



        /* Tag Parsers */
        function parseParagraph(node) {
            var contentFragment = editor.sanitize.clean_node(node)            
            var content = domFragmentToHTML(contentFragment);
            if (content.trim() === "") {
                return;
            }
            else {
                return {type:"html", tagName:"P", content: content}; //a block in the right format
            }   
        }

        function renderParagraph(block) {
            return block.content;
        }

        function parseList(node) {
            var content = [];
            for (var j = 0; j < node.childNodes.length; j++) {
                if (node.childNodes[j].nodeType === 1 && node.childNodes[j].nodeName === "LI") {
                    var contentFragment = editor.sanitize.clean_node(node.childNodes[j]);
                    content.push(domFragmentToHTML(contentFragment));
                }
            }
            return {type:"html", tagName:node.nodeName, content: content}
        }

        function renderListItem(block) {

        }

        function renderList(block) {
            var html = "";
            for (var i = 0; i<block.content.length; i++) {
                html +="<li>" + block.content[i] + "</li>";
            }
            return html;
        }

        function parseIframe(node) {

        }

        function renderIframe(block) {

            //wrap in embed div?
        }

        function parseDiv(node) {
            //one of our inline objects that has a type specified
            var content = {};
            if (node.getAttribute("data-type")) {
                //throw all data attributes into content.
                if (typeof self.inlineObjectParsers[node.getAttribute("data-type")] === "function") {
                    content = self.inlineObjectParsers[node.getAttribute("data-type")](node);
                }
                for (var i=0; i < node.attributes.length; i++){
                    var name = node.attributes[i].nodeName;
                    if (name.indexOf("data-") === 0) {
                        //don't override if value exists already
                        if (typeof content[name.replace("data-", "")] === "undefined") {
                            content[name.replace("data-", "")] = node.attributes[i].nodeValue;
                        }
                    }
                }
                return {type:"inline", content: content}
            }
            else { //it could just be a paragraph. Let's parse it as such. 
                return parseParagraph(node);
            }
        }


        function parseBlockquote(node) {
            
            return {type:'html', tagName:"BLOCKQUOTE", content: fragmentToBlocks(node)};
            
        }

        function renderBlockquote(block) {

            console.log("renderBlockquote", block.content);
            return domFragmentToHTML(blocksToFragment(block.content));
        }



        //returns the block where the cursor's currently at
        self.getCurrentBlock = function() {
        }



        editor.blocks = self;
        

    }
    global.EditorModules.push(Blocks);
})(this);