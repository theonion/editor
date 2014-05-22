define('onion-editor',[
  'scribe',
  'scribe-plugin-blockquote-command',
  'scribe-plugin-curly-quotes',
  'scribe-plugin-formatter-plain-text-convert-new-lines-to-html',
  'scribe-plugin-heading-command',
  'scribe-plugin-intelligent-unlink-command',
  'scribe-plugin-keyboard-shortcuts',
  'scribe-plugin-link-prompt-command',
  'scribe-plugin-sanitizer',
  'scribe-plugin-smart-lists',
  'scribe-plugin-toolbar',
  'scribe-plugin-inline-objects',
], function (
  Scribe,
  scribePluginBlockquoteCommand,
  scribePluginCurlyQuotes,
  scribePluginFormatterPlainTextConvertNewLinesToHtml,
  scribePluginHeadingCommand,
  scribePluginIntelligentUnlinkCommand,
  scribePluginKeyboardShortcuts,
  scribePluginLinkPromptCommand,
  scribePluginSanitizer,
  scribePluginSmartLists,
  scribePluginToolbar,
  scribePluginInlineObjects
) {

  'use strict';

  var defaults = {
    multiline: true,
    formatting: {
      link: true,
      bold: true,
      italic: true,
      blockquote: true,
      heading: true,
      list: true,
    }
  }

  function OnionEditor(element, options) {
    var self = this;    
    self.element = element;

    options = $.extend(defaults, options);
    
    console.log(options);
    var scribe = new Scribe(self.element, { allowBlockElements: true });      

    /**
    * Keyboard shortcuts
    */
    var ctrlKey = function (event) { return event.metaKey || event.ctrlKey; };


    var keyCommands = {};

    // Allowable Tags
    var tags = {};
    
    if (options.multiline) {
      tags.p = {};
      tags.br = {};
      tags.hr = {};
    }

    if (options.formatting.bold) {
      keyCommands.bold = function (event) { return event.metaKey && event.keyCode === 66; }; // b
      tags.b = {};
    }
    if (options.formatting.italic) {
      keyCommands.italic = function (event) { return event.metaKey && event.keyCode === 73; }; // i
      tags.i = {};
      tags.em = {};
    }
    if (options.formatting.strike) {
      keyCommands.strikeThrough = function (event) { return event.altKey && event.shiftKey && event.keyCode === 83; }; // s
      tags.s = {};
    }
    keyCommands.removeFormat = function (event) { return event.altKey && event.shiftKey && event.keyCode === 65; }; // a
    if (options.multiline && options.formatting.links) {
      keyCommands.linkPrompt = function (event) { return event.metaKey && ! event.shiftKey && event.keyCode === 75; }; // k
      keyCommands.unlink = function (event) { return event.metaKey && event.shiftKey && event.keyCode === 75; }; // k,
      scribe.use(scribePluginIntelligentUnlinkCommand());
      scribe.use(scribePluginLinkPromptCommand());
      tags.a = { href:true, target:true }
    }
    if (options.multiline &&  options.formatting.list) {
      keyCommands.insertUnorderedList = function (event) { return event.altKey && event.shiftKey && event.keyCode === 66; }; // b
      keyCommands.insertOrderedList = function (event) { return event.altKey && event.shiftKey && event.keyCode === 78; }; // n
      scribe.use(scribePluginSmartLists());
      tags.ol = {};
      tags.ul = {};
      tags.li = {};
    }
    if (options.multiline && options.formatting.blockquote) {
      keyCommands.blockquote = function (event) { return event.altKey && event.shiftKey && event.keyCode === 87; }; // w
      scribe.use(scribePluginBlockquoteCommand());
      tags.blockquote = {};
    }
    if (options.multiline && options.formatting.heading) {
      keyCommands.h3 = function (event) { return ctrlKey(event) && event.keyCode === 50; }; // 2
      keyCommands.h4 = function (event) { return ctrlKey(event) && event.keyCode === 51; }; // 2
      scribe.use(scribePluginHeadingCommand(3));
      scribe.use(scribePluginHeadingCommand(4));
      tags.h3 = {};
      tags.h4 = {};
    }


    scribe.use(scribePluginSanitizer({
      tags: tags
    }));


    // initialize Scribe plugins
    
    scribe.use(scribePluginCurlyQuotes());

    scribe.use(scribePluginKeyboardShortcuts(Object.freeze(keyCommands)));

    //TODO: kill this existing toolbar & replace w/ Medium style selection toolbar
    if (options.multiline) {
      scribe.use(scribePluginToolbar($('.document-tools .toolbar-contents', options.element)[0]));
    }
    else {
      $('.document-tools .toolbar-contents').hide();
    }



    scribe.use(scribePluginFormatterPlainTextConvertNewLinesToHtml());

    this.setContent = function(content) {
      scribe.setContent(content);
    }

    this.getContent = function(content) {
      //todo: if multiline is false, only return contents of the paragraph

      return self.element.textContent 
    }
    return this;
  } 

  return OnionEditor;

});
