/*

Tools to manipulate and build blocks.

*/


(function(global) {
    'use strict';
    var BlockTools = BlockTools || function(editor, options) {
        var self = this;

        self.tagParsers = {
            'P': parseParagraph,
            'LI': parseListItem,
            'OL': parseList,
            'UL': parseList,
            'BLOCKQUOTE':parseBlockquote,
            'IFRAME':parseIframe,
            'DIV':parseDiv,
            'HR': parseHr
        }


        self.tagRenderers = {
            'P': renderParagraph,
            'OL': renderList,
            'UL': renderList,
            'LI': renderListItem,
            'BLOCKQUOTE':renderBlockquote,
            'IFRAME':renderIframe,
            'HR': renderHr
            /*'DIV':renderDiv (there should be no freestanding divs in the blocklist) */
        }


        /* these are defined by outside modules */
        self.inlineObjectParsers = {};

        /* for extra pre-processing in block content data, if needed */
        self.inlineObjectRenderers = {};


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

        /* i don't really like this.*/ 
        function findBlockIndexById(id, blockList) {
            for (var i=0;i <blockList.length;i++) {
                if (blockList[i].id === id) {
                    return [blockList, i];
                }
                else if ($.isArray(blockList[i].blocks)) {
                    var match = findBlockIndexById(id, blockList[i].blocks);
                    if (match) {
                        return match;
                    }
                }
            }
        }
        
        function findBlockById(id, blockList) {
            for (var i=0;i <blockList.length;i++) {
                if (blockList[i].id === id) {
                    return blockList[i];
                }
                else if ($.isArray(blockList[i].blocks)) {
                    var match = findBlockById(id, blockList[i].blocks);
                    if (match) {
                        return match;
                    }
                }
            }
        }

        self.insertBlocksAfter = function(id, blockListA, blockListB) {
            for (var i=0;i <blockListA.length;i++) {
                if (blockListA[i].id === id) {
                    for (var j=0; j<blockListB.length; j++) {
                        blockListA.splice(i+j+1,0, blockListB[j]);
                    }
                    var fragment = blocksToFragment(blockListB);
                    var el = document.getElementById(blockListA[i].id);
                    $(el).after(fragment);                    
                    var range = rangy.createRange();
                    range.setStartAfter(el);
                    var sel = rangy.getSelection();
                    sel.setSingleRange(range);
                    return;
                }
                else if ($.isArray(blockListA[i].blocks)) {
                    self.insertBlocksAfter(id, blockListA[i].blocks, blockListB);
                }
            }
        }




        self.removeBlock = function(id, blockList) {
            //var block = findBlockById(id, blockList);
            var match = findBlockIndexById(id, blockList);
            match[0].remove(match[1]);
            //no need for a full re-render. this is a simple op.
            $("#" + id).remove();
        }

        /* 

        Takes in an existing blocklist and Id. takes a new blocklist, merges the f

        */



        self.mergeAdjacentBlocks = function(id1, id2, blockList) {
            var block1 = findBlockById(id1, blockList);
            var block2 = findBlockById(id2, blockList);
            
            //console.log(match1, match2);
            //console.log(id1, id2);
            
            console.log(block1, block2);


        }
        
        self.swapBlocks = function(id1, id2) {

        }

        //puts back changes typed into a block. Should only really apply to typing. 
        self.syncBlockContent = function (id, blockList) {
            var block = findBlockById(id, blockList);
            block.content = document.getElementById(id).innerHTML;
        }


        //converts a fragment of HTML into structured & sanitized blocks. 
        function fragmentToBlocks(domFragment, stripIDs) {
            var blockList = [];
            for (var i = 0; i < domFragment.childNodes.length; i++) {
                var node = domFragment.childNodes[i];
                //assign an ID to the block */
                if (!node.id || stripIDs === true) {
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
                    $(node).addClass("block");
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

        function parseTextContent(node, tagName) {
            var contentFragment = editor.sanitize.clean_node(node)   
            var content = domFragmentToHTML(contentFragment);
            if (content.trim() === "") {
                return {type:"html", tagName:tagName, content: "<BR>"};
            }
            else {
                return {type:"html", tagName:tagName, content: content}; //a block in the right format
            }
        }

        function parseParagraph(node) {
            return parseTextContent(node, "P");
        }

        function renderParagraph(block) {
            return block.content;
        }


        /* list items */
        function parseList(node) {
            return {type:'html', tagName:node.nodeName, blocks: fragmentToBlocks(node)};
        }
        function parseListItem(node) {
            return parseTextContent(node, "LI");
        }
        function renderListItem(node) {
            return node.content;
        }

        function renderList(block) {
            return domFragmentToHTML(blocksToFragment(block.blocks));
        }

        function parseHr(node) {

        }
        function renderHr(block) {

        }

        function parseIframe(node) {

        }

        function renderIframe(block) {

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
            return {type:'html', tagName:"BLOCKQUOTE", blocks: fragmentToBlocks(node)};
        }

        function renderBlockquote(block) {
            return domFragmentToHTML(blocksToFragment(block.blocks));
        }


        self.fragmentToBlocks = fragmentToBlocks;
        self.blocksToFragment = blocksToFragment;
        self.domFragmentToHTML = domFragmentToHTML;

        editor.blockTools = self;
        

    }
    global.EditorModules.push(BlockTools);
})(this);