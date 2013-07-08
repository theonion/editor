/*! onion-editor 2013-07-08 */
//     keymaster.js
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
;(function(global){

    'use strict';

    global.EditorModules = []; //a place to keep track of modules

    var Editor = Editor || function(options) {
        var self = this,
        defaults = {
                element: null, /* element to make Editable */
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
        cursor = {
            updateFocus: function() {
                setTimeout(function() {
                    var sel = window.getSelection();
                    if (sel && sel.type != "None" ) {
                        var range = sel.getRangeAt(0);
                        var node = range.commonAncestorContainer.parentNode;
                        $(".editor>div,.editor>p").removeClass("focus");
                        
                        if ($(node).is(".editor>div,.editor>p")) {
                            $(node).addClass("focus");
                        }
                        else {
                            $(node).parents(".editor>div,.editor>p").addClass("focus");
                        }
                        //move the little focus indicator 
                        if ($(".focus").length > 0)
                            $(".focus-cursor").css({top:$(".focus").position().top+5}).show();
                    }
                }, 20)
            }

        }






        function init(options) {            
            for (var i=0;i<global.EditorModules.length;i++) {
                moduleInstances.push(new global.EditorModules[i](self, options));
            }
            $(options.element)
                .append('<div class="editor-wrapper"><div class="editor" contenteditable="true" spellcheck="true"><p></p></div>'
                        + '<div class="focus-cursor icon-caret-right"></div></div>')
                
            self.emit("init");


            $(options.element)
                .bind("keydown", function(e) {

                    // handle enter key shit. 
                    if (e.keyCode === 13) {

                        //e.preventDefault();
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
                    var pastedFragment = document.createDocumentFragment();
                    var div = document.createElement("DIV");
                    pastedFragment.appendChild(div);

                    global.frag = pastedFragment;


                    var text = e.originalEvent.clipboardData.getData('text/plain');
                    pastedFragment.querySelector("div").innerHTML =  e.originalEvent.clipboardData.getData('text/html')

                    console.log(pastedFragment);
                    if (window.getSelection) {
                        var sel = window.getSelection();
                        if (sel.getRangeAt && sel.rangeCount) {
                            var range = sel.getRangeAt(0);
                            range.deleteContents(); 
                            document.execCommand("InsertHTML", false, text);
                        }
                    }
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

        function init() {
            self.toolbarElement = $(options.element).find(".toolbar");

            //handle clicks
            self.toolbarElement.click(function(e) {
                editor.emit("toolbar:click:" + $(e.target).attr("name")); 
            });
            editor.emit("toolbar:ready");
        }
    }
    global.EditorModules.push(Toolbar);
})(this)

;(function(global) {
    'use strict';
    var RichText = RichText || function(editor, options) {
        var self = this;

        key('⌘+b, ctrl+b', _bold);
        key('⌘+i, ctrl+i', _italic);
        key('⌘+u, ctrl+u', _underline);

        function _bold() {
            document.execCommand("BOLD");
        }
        function _italic() {
            document.execCommand("ITALIC");
        }
        function _underline(){ 
            document.execCommand("UNDERLINE");
        }
        function _strikethrough() {
            document.execCommand("STRIKETHROUGH");
        }
        function _unorderedList() {
            document.execCommand('formatBlock', false, 'ul');
        }

        editor.on("toolbar:click:italic", _italic);
        editor.on("toolbar:click:bold", _bold);
        editor.on("toolbar:click:underline", _underline);
        editor.on("toolbar:click:strikethrough", _strikethrough);
        editor.on("toolbar:click:unorderedlist", _unorderedList);


        editor.on("toolbar:ready", function() {
            /*
            editor.toolbar.addButton({ name: "bold",  icon: "icon-bold"});
            editor.toolbar.addButton({ name: "italic", icon: "icon-italic"});
            editor.toolbar.addButton({ name: "underline", icon: "icon-underline"});
            editor.toolbar.addButton({ name: "strikethrough", icon: "icon-strikethrough"});
            editor.toolbar.addButton({ name: "unorderedlist", icon: "icon-list-ul"});

            editor.toolbar.addSpacer();
            */
        });
    }
    global.EditorModules.push(RichText);
})(this)
          



/* Editing commands */
/*
  <button class="textstyle icon-italic" data-nodetype="I" title="Italic"></button>

function _bold() {
    document.execCommand("BOLD");
}
function _italic() {
    document.execCommand("ITALIC");
}
function _underline(){ 
    document.execCommand("UNDERLINE");
}
function _strikethrough() {
    document.execCommand("STRIKETHROUGH");
}
function _blockquote() {
    document.execCommand("FORMATBLOCK", false, "<blockquote>");
}
function _undo(){ 
    document.execCommand("UNDO", false, "");
}
function _redo(){ 
    document.execCommand("REDO", false, "");
}
function _link() {
    if (document.execCommand("createLink", true, "#replaceme")) {
        sel = window.getSelection();
        range = sel.getRangeAt(0);
        _editLink(range.commonAncestorContainer.parentElement);    
    }
}
function _orderedList() {
    document.execCommand("insertorderedlist", false, null);   
}
function _unorderedList() {
    document.execCommand("insertunorderedlist", false, null);   
}

key('⌘+b, ctrl+b', _bold);
key('⌘+i, ctrl+i', _italic);
key('⌘+u, ctrl+u', _underline);

$("#toolbar .icon-bold").click(_bold);
$("#toolbar .icon-italic").click(_italic);
$("#toolbar .icon-underline").click(_underline);
$("#toolbar .icon-strikethrough").click(_strikethrough);
$("#icontoolbar .icon-list-ol").click(_orderedList);
$("#icontoolbar .icon-list-ul").click(_unorderedList);
$("#toolbar .icon-link").click(_link);
// $("#toolbar .icon-quote-left").click(_blockquote);
$("#undoBtn").click(_undo);
$("#redoBtn").click(_redo);
*/


;(function(global) {
    'use strict';
    var TextReplacement = TextReplacement || function(editor, options) {
        var self = this;

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
                console.log(e.keyCode);
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

