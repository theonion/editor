/*! onion-editor 2013-07-19 */
(function(global){

    'use strict';

    global.EditorModules = []; //a place to keep track of modules

    var Editor = Editor || function(options) {
        var self = this,
        defaults = {
                element: null, /* element to make Editable */
                sanitize: {
                  elements: ['b', 'em', 'i', 'strong', 'u', 'p','blockquote','a', 'ul', 'ol', 'li','br'],
                  attributes: {'a': ['href', 'title']},
                  remove_contents: ['script', 'style', ],
                  protocols: { a: { href: ['http', 'https', 'mailto']}},
                },
                /* settings gets serialized & dumped to local storage. put things you want to persist in here */
                settings: {} 
        },
        moduleInstances = [],
        utils = { /* a place for non-editor specific function calls */
            enableEvents: function (obj) {
                obj.__listeners__ = obj.__listeners__ || {};

                obj.on = function on(evt, fn) {
                    var fns = obj.__listeners__[evt] || (obj.__listeners__[evt] = []);
                    fns.push(fn);
                };

                obj.off = function off(evt, fn) {
                    var fns = obj.__listeners__[evt] || [];
                    var updated = [];

                    for (var n = 0, l = fns.length; n < l; n++) {
                        if (fns[n] !== fn) updated.push(fns[n]);
                    }

                    obj.__listeners__[evt] = updated;
                };

                obj.emit = function emit (evt) {
                    var args = Array.prototype.slice.call (arguments, 1) ;
                    var fns = obj.__listeners__[ evt ] || [];

                    for (var n = 0, l = fns.length; n < l; n++) {
                        try {
                            fns[n].apply(null, args);
                        }
                        catch (e) {}
                    }
                };
            }
        },
        sanitize;

        function loadSettings() {
            if (localStorage.editorSettings) {
                options.settings = JSON.parse(global.localStorage.editorSettings)
            }
        }
        self.updateSetting = function(key, value) {
            options.settings[key] = value;
            global.localStorage.editorSettings = JSON.stringify(options.settings);
        }

        function init(options) {  
            loadSettings();
            for (var i=0;i<global.EditorModules.length;i++) {
                moduleInstances.push(new global.EditorModules[i](self, options));
            }
            
            $(options.element)
                .append('<div class="editor-wrapper">\
                            <div class="editor" contenteditable="true" spellcheck="false">\
                                <p></p>\
                            </div>\
                            <div class="document-tools toolbar"></div>\
                            <div class="selection-tools toolbar"></div>\
                            <div class="embed-overlay"></div>\
                        </div>');
                
            sanitize = new Sanitize(options.sanitize);

            self.emit("init");

            $(options.element)
                .bind("click", function(e) {
                    self.emit("click", e);
                })
                .bind("keydown", function(e) {

                    // handle enter key shit. 
                    if (e.keyCode === 13) {
                        //e.preventDefault();

                        //determine if enter is pressed in an empty node. Do the right thing
                        


                        if (!self.selection.hasSelection() && self.selection.hasFocus()) {
                            var node = self.selection.getAnchorNode();
                            console.log("text: " + $(node).text());
                            if ($(node).text() == "") {
                                console.log("BLANK, DO SOMTHIN");
                                console.log(self.selection.getRootParent());
                                var rootTagName = self.selection.getRootParent().tagName;
                                console.log("rootTag: " + rootTagName);
                                if (rootTagName == "BLOCKQUOTE") {
                                    // Remove current node, 
                                    // Insert new paragraph.
                                    // make sure cursor is in there.

                                    e.preventDefault();
                                }
                                else if (rootTagName == "OL" || rootTagName == "UL") {
                                    // Remove current node, 
                                    
                                    var container = node.parentNode;    
                                    $(node).remove();
                                    $(container).after("<p><br></p>")
                                    var sel = window.getSelection();
                                    var range = document.createRange();
                                    range.selectNodeContents($(container).next()[0]);
                                    range.collapse(true);
                                    sel.removeAllRanges();
                                    sel.addRange(range);
                                    //remove an empty <UL> or <OL>
                                    if ($("li", container).length == 0) {
                                        $(container).remove();
                                    }

                                    e.preventDefault();
                                }
                            }
                        }
                    }
                    else if (e.keyCode === 8) {
                        var sel = window.getSelection()
                        //this happens when the cursor is in the last remaining empty paragraph. 
                        if (sel.focusNode.tagName === "P" && $(".editor>*").length == 1) {
                            e.preventDefault();
                        }
                    }
                    self.emit("keydown", e);
                })
                .bind("keyup", function(e) {
                    self.emit("keyup", e);
                })
                .bind("paste", function(e) {
                    /* this doesn't look very pretty & it bothers me. Probably a cleaner way to do this? */
                    var pastedHTML = e.originalEvent.clipboardData.getData('text/html');
                    var fragment = document.createDocumentFragment();
        
                    fragment.appendChild(document.createElement("div"))
                    fragment.childNodes[0].innerHTML = pastedHTML;
                    var cleanFrag =  sanitize.clean_node(fragment.childNodes[0]);
                    var cleanHTML = "";
                    for (var i = 0; i < cleanFrag.childNodes.length; i++) {
                        var node = cleanFrag.childNodes[i];
                        if (node.nodeType == 3) {
                            cleanHTML += node.nodeValue;
                        }
                        else if (node.nodeType == 1) {
                            if (!cleanFrag.childNodes[i].innerText == "") { // exclude tags with no content
                                cleanHTML += cleanFrag.childNodes[i].outerHTML;
                            }
                        }
                    }

                    self.selection.insertOrReplace(cleanHTML)

                    e.preventDefault();
                    self.emit("paste");
                })
        };

        utils.enableEvents(self);

        self.setContent = function(contentHTML) {
            $(options.element).find(".editor").html(contentHTML);
        }

        options = $.extend(defaults, options);


        init(options);
    }
    global.Editor = Editor;

})(this);(function(global) {
    'use strict';
    var Toolbar = Toolbar || function(editor, options) {
        var self = this;
        
        editor.on("init", init);

        //TODO: localize these events just to the editor instance
        
        editor.on("selection:change", update);
        function update(e) {
            setTimeout( //give the browser a chance to catch up
                function() {
                    //check if selection is in the editor itself.
                    var currentBlockNode = editor.selection.getRootParent();
                    if (currentBlockNode) {
                        var blockTop = $(currentBlockNode).position().top;
                        if (editor.selection.hasSelection()) {
                            $(".selection-tools").css({top: blockTop  - 35})
                            $(".selection-tools").show();
                            return;
                        }
                    }
                    $(".selection-tools").hide();
                }   
            , 5);
        }

        function init() {

            $(options.element).find(".document-tools").html(options.toolbar.documentTools);
            $(options.element).find(".selection-tools").html(options.toolbar.selectionTools);


            self.toolbarElement = $(options.element).find(".toolbar");  

            //handle clicks
            self.toolbarElement.click(function(e) {
                editor.emit("toolbar:click", $(e.target).attr("name")); 
            });

            self.toolbarElement.bind("mouseover", function(e) {
                editor.emit("toolbar:over", $(e.target).attr("name")); 
            });

            self.toolbarElement.bind("mouseout", function(e) {
                editor.emit("toolbar:out", $(e.target).attr("name")); 
            });

            editor.emit("toolbar:ready");
        }
    }
    global.EditorModules.push(Toolbar);
})(this)

;(function(global) {
    'use strict';
    var Formatting = Formatting || function(editor, options) {
        var self = this;

        editor.on("init", init);

        function init() {
            if (options.settings.visualize) {
                $(options.element)
                    .addClass("visualize");
            }
        }

        var commands = {
            bold : function() {
                global.document.execCommand("bold");
            },
            italic: function() {
                global.document.execCommand("italic");
            },
            underline: function() {
                global.document.execCommand("underline");
            },
            strikethrough: function() {
                global.document.execCommand("strikethrough");
            },
            superscript: function() {
                global.document.execCommand("superscript");
            },
            subscript: function() {
                global.document.execCommand("subscript");
            },
            unorderedlist: function() {
                //global.document.execCommand('insertunorderedlist', null, null)
            },
            orderedlist: function() {
                //global.document.execCommand('insertorderedlist', null, null)
            },
            blockquote: function() {
                //global.document.execCommand('formatBlock', null, '<blockquote>')
            },
            visualize: function() {
                editor.updateSetting("visualize", 
                    $(options.element)
                        .toggleClass("visualize")
                        .hasClass("visualize"));
            },


            //I don't think these belong here? maybe in base?
            undo: function() {
                global.document.execCommand("undo", false, "");
            },
            redo: function() {
                global.document.execCommand("redo", false, "");
            },
            removeformatting: function() {
                global.document.execCommand("removeformat", false, "");

            }
        }

        key('⌘+b, ctrl+b', commands["bold"]);
        key('⌘+i, ctrl+i', commands["italic"]);
        key('⌘+u, ctrl+u', commands["underline"]);

        editor.on("toolbar:click", function(name) {
            if (typeof commands[name] === "function" ) {
                commands[name]();
            }
        })

        /*
        function _link() {
            if (global.document.execCommand("createLink", true, "#replaceme")) {
                sel = window.getSelection();
                range = sel.getRangeAt(0);
                _editLink(range.commonAncestorContainer.parentElement);    
            }
        }
        */

    }
    global.EditorModules.push(Formatting);
})(this)

;/* This deals with all Range & Selection stuff. Keeping it all in one place will help make this 
whole thing be cross-browser more easily. Also, this code always looks ugly, so let's keep
it in one place. */

(function(global) {
    'use strict';
    var Selection = Selection || function(editor, options) {
        var self = this;
        var w = global;
        var s = w.getSelection();

        self.insertOrReplace = function(html) {
            if (s) {
                if (s.getRangeAt && s.rangeCount) {
                    var range = s.getRangeAt(0);
                    range.deleteContents(); 
                    w.document.execCommand("InsertHTML", false, html);
                }
            }
        }

        //returns true if the cursor is in the editor
        self.hasFocus = function() {
            if (s.focusNode) {
                if ($.contains(options.element, s.focusNode)) {
                    return true;
                }
            }
            return false;
        }

        // returns true there is selected text in the editor
        self.hasSelection = function() {
            if (self.hasFocus()) { //any selection will not suffice, must be in this editor
                if (s.type === "Range") {
                    return true
                }
            }
            return false;
        }

        //from stackoverflow, p
        function getSelectionCoords() {
            var sel = document.selection, range;
            var x = 0, y = 0;
            if (window.getSelection) {
                sel = window.getSelection();
                if (sel.rangeCount) {
                    range = sel.getRangeAt(0).cloneRange();
                    if (range.getClientRects) {
                        range.collapse(true);
                        var rect = range.getClientRects()[0];
                        x = rect.left;
                        y = rect.top;
                    }
                }
            }
            return { x: x, y: y };
        }


        //returns the parent of the focus node that is the immediate child of the editor itself
        self.getRootParent = function() {
            if (self.hasFocus()) {
                var parents = $(s.anchorNode).parentsUntil(".editor")
                if (parents.length > 0) {
                    return parents.slice(-1)[0];
                }
                else {
                    return s.anchorNode;
                }
            }
            return null;
        }

        self.getAnchorNode = function() {
            return s.anchorNode;
        }
        self.getFocusNode = function() {
            return s.focusNode;
        }

        // emit a selction change event. 
        $(w.document).bind("selectionchange",
            function(e) {
                editor.emit("selection:change");
                //do we want to emit a "got focus & lost focus" event? Would require maintaining state.
            }
        );

        // make it possible to call selection methods from other modules
        editor.selection = self;
    }
    global.EditorModules.push(Selection);
})(this);(function(global) {
    'use strict';
    var Embed = Embed || function(editor, options) {
        var self = this;


        function init() {

            $("#embed-panel-close").click(function() { $("#embed-panel").removeClass("open") })
        }

        init();

        function previewItem(type) {
            var node = editor.selection.getRootParent();
            var item = editor.embed.types[type];
            if (node) {
                $(node).before(item.placeholder);
            }
        }

        function placeItem(type) {
            //try to use INSERTHML so undo works
            $(".placeholder", editor.element).removeClass("placeholder");
        }


        editor.on("toolbar:click", function(type) {
            if (typeof editor.embed.types[type] === "object" ) {
                //TODO: manage templates better
                $("#embed-panel-contents")
                    .html($("#embed-panel-" + type).html());

                $("#embed-panel")
                    .addClass("open");
                

            }
        })
        
        editor.embed = {};

        //let's hardcode some types here for now. break into files later
        editor.embed.types = {
            
            image: {
                edit: function() {
                    //this happens when you edit.
                },
                placeholder: '<div class="inline image left placeholder">\
                    <img src="http://placehold.it/400x300/C0392B/F39C12">\
                    <span class="caption">A delightful image</span>\
                    </div>'
            },
            video: {
                edit: function() {
                    //this happens when you edit.
                },
                placeholder: '<div class="inline right video placeholder">\
                    <img src="http://placehold.it/240x135/27AE60/ffffff">\
                    <span class="caption">An enjoyable video</span>\
                    </div>'
            },

            audio: {
                edit: function () {}

            },
            tweet: {
                edit: function () {}

            },
            specialchars: {
                edit: function () {}

            },
            html: {
                edit: function () {}

            }

        }
    }
    global.EditorModules.push(Embed);
})(this);(function(global) {
    'use strict';
    var TextReplacement = TextReplacement || function(editor, options) {
        var self = this;

        //move this to getSelection
        function _getPrecedingCharacter() {
            var sel = window.getSelection();
            if (sel.focusOffset == 0) {
                return -1
            }
            else {
                return sel.focusNode.textContent.substr(sel.focusOffset-1, 1).charCodeAt(0);
            }
        }

        function replaceText(e) {
            if (e.keyCode == 222) { //either a single quote or double quote was pressed                
                var p = _getPrecedingCharacter();
                var chr;
                switch (p) {
                    case -1:  //no character
                    case 32:  //space
                    case 160: //nbsp
                        if (e.shiftKey) 
                            chr = "&ldquo;";
                        else
                            chr = "&lsquo;";
                    break;
                    default: 
                        if (e.shiftKey) 
                            chr = "&rdquo;";
                        else
                            chr = "&rsquo;";
                }
                document.execCommand("InsertHTML", false, chr);
                e.preventDefault();
            }

        }  
        editor.on("keydown", replaceText);
    }
    global.EditorModules.push(TextReplacement);
})(this)

;
(function(global) {
    'use strict';
    var Screensize = Screensize || function(editor, options) {
        var self = this;
        var sizes = ["mobile", "desktop", "tablet"];
        editor.on("toolbar:click", function(name) {
            if (sizes.indexOf(name) !== -1) {
                $(options.element)
                	.removeClass(sizes.join(" "))
                	.addClass(name);
            }
        })
    }
    global.EditorModules.push(Screensize);
})(this);(function(global) {
    'use strict';
    var Theme = Theme || function(editor, options) {
        var self = this;

        editor.on("init", init);

        function init() {
            $(options.element)
                .addClass(options.settings.font)
                .addClass(options.settings.color)
        }

        var opts = {
            color: ["light", "dark"],
            font: ["monospace", "sans-serif", "serif"]
        } 

        editor.on("toolbar:click", function(name) {
            if (name === "font" || name === "color") {
                var i = opts[name].indexOf(options.settings[name]);
                if (i == opts[name].length -1) {
                    i = 0;
                }
                else {
                    i++;
                }
                $(options.element)
                    .removeClass(opts[name].join(" "))
                    .addClass(opts[name][i]);
                editor.updateSetting(name, opts[name][i]);
            }
        })
    }
    global.EditorModules.push(Theme);
})(this);(function(global) {
    'use strict';
    var Stats = Stats || function(editor, options) {
        var self = this;

        editor.on("init", updateStats);

        function updateStats() {
            var text = $(".editor", editor.element)[0].innerText;
            var wordcount = text.split(/\s+/).length - 1;
            var stats = {
                wordcount: wordcount,
                characters: text.length,
                readingtime: wordcount / 225
            }
            $(".wordcount", editor.element).html(wordcount);
            setTimeout(updateStats, 5000);
        }
    }
    global.EditorModules.push(Stats);
})(this);/**
 * Copyright (c) 2010 by Gabriel Birke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

function Sanitize(){
  var i, e, options;
  options = arguments[0] || {};
  this.config = {};
  this.config.elements = options.elements ? options.elements : [];
  this.config.attributes = options.attributes ? options.attributes : {};
  this.config.attributes[Sanitize.ALL] = this.config.attributes[Sanitize.ALL] ? this.config.attributes[Sanitize.ALL] : [];
  this.config.allow_comments = options.allow_comments ? options.allow_comments : false;
  this.allowed_elements = {};
  this.config.protocols = options.protocols ? options.protocols : {};
  this.config.add_attributes = options.add_attributes ? options.add_attributes  : {};
  this.dom = options.dom ? options.dom : document;
  for(i=0;i<this.config.elements.length;i++) {
    this.allowed_elements[this.config.elements[i]] = true;
  }
  this.config.remove_element_contents = {};
  this.config.remove_all_contents = false;
  if(options.remove_contents) {
    
    if(options.remove_contents instanceof Array) {
      for(i=0;i<options.remove_contents.length;i++) {
        this.config.remove_element_contents[options.remove_contents[i]] = true;
      }
    }
    else {
      this.config.remove_all_contents = true;
    }
  }
  this.transformers = options.transformers ? options.transformers : [];
}

Sanitize.REGEX_PROTOCOL = /^([A-Za-z0-9\+\-\.\&\;\*\s]*?)(?:\:|&*0*58|&*x0*3a)/i;
Sanitize.RELATIVE = '__relative__'; // emulate Ruby symbol with string constant

Sanitize.prototype.clean_node = function(container) {
  var fragment = this.dom.createDocumentFragment();
  this.current_element = fragment;
  this.whitelist_nodes = [];

  

  /**
   * Utility function to check if an element exists in an array
   */
  function _array_index(needle, haystack) {
    var i;
    for(i=0; i < haystack.length; i++) {
      if(haystack[i] == needle) 
        return i;
    }
    return -1;
  }
  
  function _merge_arrays_uniq() {
    var result = [];
    var uniq_hash = {};
    var i,j;
    for(i=0;i<arguments.length;i++) {
      if(!arguments[i] || !arguments[i].length)
        continue;
      for(j=0;j<arguments[i].length;j++) {
        if(uniq_hash[arguments[i][j]])
          continue;
        uniq_hash[arguments[i][j]] = true;
        result.push(arguments[i][j]);
      }
    }
    return result;
  }
  
  /**
   * Clean function that checks the different node types and cleans them up accordingly
   * @param elem DOM Node to clean
   */
  function _clean(elem) {
    var clone;
    switch(elem.nodeType) {
      // Element
      case 1:
        _clean_element.call(this, elem);
        break;
      // Text
      case 3:
        clone = elem.cloneNode(false);
        this.current_element.appendChild(clone);
        break;
      // Entity-Reference (normally not used)
      case 5:
        clone = elem.cloneNode(false);
        this.current_element.appendChild(clone);
        break;
      // Comment
      case 8:
        if(this.config.allow_comments) {
          clone = elem.cloneNode(false);
          this.current_element.appendChild(clone);
        }
        break;
      default:
        if (console && console.log) console.log("unknown node type", elem.nodeType);
        break;
    }
 
  }
  
  function _clean_element(elem) {
    var i, j, clone, parent_element, name, allowed_attributes, attr, attr_name, attr_node, protocols, del, attr_ok;
    var transform = _transform_element.call(this, elem);
    
    elem = transform.node;
    name = elem.nodeName.toLowerCase();
    
    // check if element itself is allowed
    parent_element = this.current_element;
    if(this.allowed_elements[name] || transform.whitelist) {
        this.current_element = this.dom.createElement(elem.nodeName);
        parent_element.appendChild(this.current_element);
        
      // clean attributes
      var attrs = this.config.attributes;
      allowed_attributes = _merge_arrays_uniq(attrs[name], attrs['__ALL__'], transform.attr_whitelist);
      for(i=0;i<allowed_attributes.length;i++) {
        attr_name = allowed_attributes[i];
        attr = elem.attributes[attr_name];
        if(attr) {
            attr_ok = true;
            // Check protocol attributes for valid protocol
            if(this.config.protocols[name] && this.config.protocols[name][attr_name]) {
              protocols = this.config.protocols[name][attr_name];
              del = attr.nodeValue.toLowerCase().match(Sanitize.REGEX_PROTOCOL);
              if(del) {
                attr_ok = (_array_index(del[1], protocols) != -1);
              }
              else {
                attr_ok = (_array_index(Sanitize.RELATIVE, protocols) != -1);
              }
            }
            if(attr_ok) {
              attr_node = document.createAttribute(attr_name);
              attr_node.value = attr.nodeValue;
              this.current_element.setAttributeNode(attr_node);
            }
        }
      }
      
      // Add attributes
      if(this.config.add_attributes[name]) {
        for(attr_name in this.config.add_attributes[name]) {
          attr_node = document.createAttribute(attr_name);
          attr_node.value = this.config.add_attributes[name][attr_name];
          this.current_element.setAttributeNode(attr_node);
        }
      }
    } // End checking if element is allowed
    // If this node is in the dynamic whitelist array (built at runtime by
    // transformers), let it live with all of its attributes intact.
    else if(_array_index(elem, this.whitelist_nodes) != -1) {
      this.current_element = elem.cloneNode(true);
      // Remove child nodes, they will be sanitiazied and added by other code
      while(this.current_element.childNodes.length > 0) {
        this.current_element.removeChild(this.current_element.firstChild);
      }
      parent_element.appendChild(this.current_element);
    }

    // iterate over child nodes
    if(!this.config.remove_all_contents && !this.config.remove_element_contents[name]) {
      for(i=0;i<elem.childNodes.length;i++) {
        _clean.call(this, elem.childNodes[i]);
      }
    }
    
    // some versions of IE don't support normalize.
    if(this.current_element.normalize) {
      this.current_element.normalize();
    }
    this.current_element = parent_element;
  } // END clean_element function
  
  function _transform_element(node) {
    var output = {
      attr_whitelist:[],
      node: node,
      whitelist: false
    };
    var i, j, transform;
    for(i=0;i<this.transformers.length;i++) {
      transform = this.transformers[i]({
        allowed_elements: this.allowed_elements,
        config: this.config,
        node: node,
        node_name: node.nodeName.toLowerCase(),
        whitelist_nodes: this.whitelist_nodes,
        dom: this.dom
      });
      if (transform == null) 
        continue;
      else if(typeof transform == 'object') {
        if(transform.whitelist_nodes && transform.whitelist_nodes instanceof Array) {
          for(j=0;j<transform.whitelist_nodes.length;j++) {
            if(_array_index(transform.whitelist_nodes[j], this.whitelist_nodes) == -1) {
              this.whitelist_nodes.push(transform.whitelist_nodes[j]);
            }
          }
        }
        output.whitelist = transform.whitelist ? true : false;
        if(transform.attr_whitelist) {
          output.attr_whitelist = _merge_arrays_uniq(output.attr_whitelist, transform.attr_whitelist);
        }
        output.node = transform.node ? transform.node : output.node;
      }
      else {
        throw new Error("transformer output must be an object or null");
      }
    }
    return output;
  }
  
  
  
  for(i=0;i<container.childNodes.length;i++) {
    _clean.call(this, container.childNodes[i]);
  }
  
  if(fragment.normalize) {
    fragment.normalize();
  }
  
  return fragment;
  
};

if ( typeof define === "function" ) {
  define( "sanitize", [], function () { return Sanitize; } );
};//     keymaster.js
//     (c) 2011-2012 Thomas Fuchs
//     keymaster.js may be freely distributed under the MIT license.

;(function(global){
  var k,
    _handlers = {},
    _mods = { 16: false, 18: false, 17: false, 91: false },
    _scope = 'all',
    // modifier keys
    _MODIFIERS = {
      '⇧': 16, shift: 16,
      '⌥': 18, alt: 18, option: 18,
      '⌃': 17, ctrl: 17, control: 17,
      '⌘': 91, command: 91
    },
    // special keys
    _MAP = {
      backspace: 8, tab: 9, clear: 12,
      enter: 13, 'return': 13,
      esc: 27, escape: 27, space: 32,
      left: 37, up: 38,
      right: 39, down: 40,
      del: 46, 'delete': 46,
      home: 36, end: 35,
      pageup: 33, pagedown: 34,
      ',': 188, '.': 190, '/': 191,
      '`': 192, '-': 189, '=': 187,
      ';': 186, '\'': 222,
      '[': 219, ']': 221, '\\': 220
    },
    code = function(x){
      return _MAP[x] || x.toUpperCase().charCodeAt(0);
    },
    _downKeys = [];

  for(k=1;k<20;k++) _MODIFIERS['f'+k] = 111+k;

  // IE doesn't support Array#indexOf, so have a simple replacement
  function index(array, item){
    var i = array.length;
    while(i--) if(array[i]===item) return i;
    return -1;
  }

  var modifierMap = {
      16:'shiftKey',
      18:'altKey',
      17:'ctrlKey',
      91:'metaKey'
  };
  function updateModifierKey(event) {
      for(k in _mods) _mods[k] = event[modifierMap[k]];
  };

  // handle keydown event
  function dispatch(event, scope){
    var key, handler, k, i, modifiersMatch;
    key = event.keyCode;

    if (index(_downKeys, key) == -1) {
        _downKeys.push(key);
    }

    // if a modifier key, set the key.<modifierkeyname> property to true and return
    if(key == 93 || key == 224) key = 91; // right command on webkit, command on Gecko
    if(key in _mods) {
      _mods[key] = true;
      // 'assignKey' from inside this closure is exported to window.key
      for(k in _MODIFIERS) if(_MODIFIERS[k] == key) assignKey[k] = true;
      return;
    }
    updateModifierKey(event);

    // see if we need to ignore the keypress (filter() can can be overridden)
    // by default ignore key presses if a select, textarea, or input is focused
    if(!assignKey.filter.call(this, event)) return;

    // abort if no potentially matching shortcuts found
    if (!(key in _handlers)) return;

    // for each potential shortcut
    for (i = 0; i < _handlers[key].length; i++) {
      handler = _handlers[key][i];

      // see if it's in the current scope
      if(handler.scope == scope || handler.scope == 'all'){
        // check if modifiers match if any
        modifiersMatch = handler.mods.length > 0;
        for(k in _mods)
          if((!_mods[k] && index(handler.mods, +k) > -1) ||
            (_mods[k] && index(handler.mods, +k) == -1)) modifiersMatch = false;
        // call the handler and stop the event if neccessary
        if((handler.mods.length == 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91]) || modifiersMatch){
          if(handler.method(event, handler)===false){
            if(event.preventDefault) event.preventDefault();
              else event.returnValue = false;
            if(event.stopPropagation) event.stopPropagation();
            if(event.cancelBubble) event.cancelBubble = true;
          }
        }
      }
    }
  };

  // unset modifier keys on keyup
  function clearModifier(event){
    var key = event.keyCode, k,
        i = index(_downKeys, key);

    // remove key from _downKeys
    if (i >= 0) {
        _downKeys.splice(i, 1);
    }

    if(key == 93 || key == 224) key = 91;
    if(key in _mods) {
      _mods[key] = false;
      for(k in _MODIFIERS) if(_MODIFIERS[k] == key) assignKey[k] = false;
    }
  };

  function resetModifiers() {
    for(k in _mods) _mods[k] = false;
    for(k in _MODIFIERS) assignKey[k] = false;
  }

  // parse and assign shortcut
  function assignKey(key, scope, method){
    var keys, mods, i, mi;
    if (method === undefined) {
      method = scope;
      scope = 'all';
    }
    key = key.replace(/\s/g,'');
    keys = key.split(',');

    if((keys[keys.length-1])=='')
      keys[keys.length-2] += ',';
    // for each shortcut
    for (i = 0; i < keys.length; i++) {
      // set modifier keys if any
      mods = [];
      key = keys[i].split('+');
      if(key.length > 1){
        mods = key.slice(0,key.length-1);
        for (mi = 0; mi < mods.length; mi++)
          mods[mi] = _MODIFIERS[mods[mi]];
        key = [key[key.length-1]];
      }
      // convert to keycode and...
      key = key[0]
      key = code(key);
      // ...store handler
      if (!(key in _handlers)) _handlers[key] = [];
      _handlers[key].push({ shortcut: keys[i], scope: scope, method: method, key: keys[i], mods: mods });
    }
  };

  // Returns true if the key with code 'keyCode' is currently down
  // Converts strings into key codes.
  function isPressed(keyCode) {
      if (typeof(keyCode)=='string') {
        keyCode = code(keyCode);
      }
      return index(_downKeys, keyCode) != -1;
  }

  function getPressedKeyCodes() {
      return _downKeys.slice(0);
  }

  function filter(event){
    var tagName = (event.target || event.srcElement).tagName;
    // ignore keypressed in any elements that support keyboard data input
    return !(tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA');
  }

  // initialize key.<modifier> to false
  for(k in _MODIFIERS) assignKey[k] = false;

  // set current scope (default 'all')
  function setScope(scope){ _scope = scope || 'all' };
  function getScope(){ return _scope || 'all' };

  // delete all handlers for a given scope
  function deleteScope(scope){
    var key, handlers, i;

    for (key in _handlers) {
      handlers = _handlers[key];
      for (i = 0; i < handlers.length; ) {
        if (handlers[i].scope === scope) handlers.splice(i, 1);
        else i++;
      }
    }
  };

  // cross-browser events
  function addEvent(object, event, method) {
    if (object.addEventListener)
      object.addEventListener(event, method, false);
    else if(object.attachEvent)
      object.attachEvent('on'+event, function(){ method(window.event) });
  };

  // set the handlers globally on document
  addEvent(document, 'keydown', function(event) { dispatch(event, _scope) }); // Passing _scope to a callback to ensure it remains the same by execution. Fixes #48
  addEvent(document, 'keyup', clearModifier);

  // reset modifiers to false whenever the window is (re)focused.
  addEvent(window, 'focus', resetModifiers);

  // store previously defined key
  var previousKey = global.key;

  // restore previously defined key and return reference to our key object
  function noConflict() {
    var k = global.key;
    global.key = previousKey;
    return k;
  }

  // set window.key and window.key.set/get/deleteScope, and the default filter
  global.key = assignKey;
  global.key.setScope = setScope;
  global.key.getScope = getScope;
  global.key.deleteScope = deleteScope;
  global.key.filter = filter;
  global.key.isPressed = isPressed;
  global.key.getPressedKeyCodes = getPressedKeyCodes;
  global.key.noConflict = noConflict;

  if(typeof module !== 'undefined') module.exports = key;

})(this);
