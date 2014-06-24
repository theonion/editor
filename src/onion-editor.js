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
  'scribe-plugin-betty-cropper',
  'scribe-plugin-youtube',
  'scribe-plugin-embed',
  'scribe-plugin-onion-video',
  'scribe-plugin-hr'
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
  scribePluginInlineObjects,
  scribePluginBettyCropper,
  scribePluginYoutube,
  scribePluginEmbed,
  scribePluginOnionVideo,
  scribePluginHr
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

    options = $.extend(defaults, options);

    if (options.onChange) {
      scribe.on('content-changed', options.onChange);
    }

    var scribe = new Scribe(element, { allowBlockElements: true });      

    var keyCommands = {};
    var ctrlKey = function (event) { return event.metaKey || event.ctrlKey; };

    // Allowable Tags
    var tags = {}, ignoredTags = {};
    
    // Multiline
    if (options.multiline) {
      tags.p = {};
      tags.br = {};
      tags.hr = {};

      ignoredTags.div = {}
    }

    // Bold
    if (options.formatting.bold) {
      keyCommands.bold = function (event) { return event.metaKey && event.keyCode === 66; }; // b
      tags.b = {};
    }

    // Italics
    if (options.formatting.italic) {
      keyCommands.italic = function (event) { return event.metaKey && event.keyCode === 73; }; // i
      tags.i = {};
      tags.em = {};
    }

    // Strike
    if (options.formatting.strike) {
      keyCommands.strikeThrough = function (event) { return event.altKey && event.shiftKey && event.keyCode === 83; }; // s
      tags.s = {};
    }

    //Remove formatting... 
    keyCommands.removeFormat = function (event) { return event.altKey && event.shiftKey && event.keyCode === 65; }; // a

    // Links
    if (options.multiline && options.formatting.link) {
      keyCommands.linkPrompt = function (event) { return event.metaKey && ! event.shiftKey && event.keyCode === 75; }; // k
      keyCommands.unlink = function (event) { return event.metaKey && event.shiftKey && event.keyCode === 75; }; // k,
      scribe.use(scribePluginIntelligentUnlinkCommand());
      scribe.use(scribePluginLinkPromptCommand());
      tags.a = { href:true, target:true }
    }

    // Lists
    if (options.multiline &&  options.formatting.list) {
      keyCommands.insertUnorderedList = function (event) { return event.altKey && event.shiftKey && event.keyCode === 66; }; // b
      keyCommands.insertOrderedList = function (event) { return event.altKey && event.shiftKey && event.keyCode === 78; }; // n
      scribe.use(scribePluginSmartLists());
      tags.ol = {};
      tags.ul = {};
      tags.li = {};
    }

    //Blockquotes
    if (options.multiline && options.formatting.blockquote) {
      keyCommands.blockquote = function (event) { return event.altKey && event.shiftKey && event.keyCode === 87; }; // w
      scribe.use(scribePluginBlockquoteCommand());
      tags.blockquote = {};
    }

    // Headings
    if (options.multiline && options.formatting.heading) {
      keyCommands.h3 = function (event) { return ctrlKey(event) && event.keyCode === 50; }; // 2
      keyCommands.h4 = function (event) { return ctrlKey(event) && event.keyCode === 51; }; // 2
      scribe.use(scribePluginHeadingCommand(3));
      scribe.use(scribePluginHeadingCommand(4));
      tags.h3 = {};
      tags.h4 = {};
    }


    // Inline Objects
    if (options.multiline && options.inlineObjects) {
      scribe.use(scribePluginInlineObjects(options.inlineObjects));
      
      // Maybe make optionally load these similar to formatting. For now, it's an all or nothing.
      scribe.use(scribePluginBettyCropper());
      scribe.use(scribePluginYoutube());
      scribe.use(scribePluginEmbed());
      scribe.use(scribePluginHr());
      scribe.use(scribePluginOnionVideo());
    }

    scribe.use(scribePluginSanitizer({
      tags: tags,
      ignoredTags: ignoredTags
    }));


    // initialize Scribe plugins
    
    scribe.use(scribePluginCurlyQuotes());

    scribe.use(scribePluginKeyboardShortcuts(Object.freeze(keyCommands)));

    //TODO: kill this existing toolbar & replace w/ Medium style selection toolbar
    if (options.multiline) {
      scribe.use(scribePluginToolbar($('.document-tools .toolbar-contents', element.parentNode)[0]));
    }
    else {
      $('.document-tools .toolbar-contents', element.parentNode).hide();
    }

    scribe.use(scribePluginFormatterPlainTextConvertNewLinesToHtml());

    this.setContent = function(content) {
      if (!content) {
          content = "<p><br></p>";
      }
      scribe.setContent(content);
    }

    this.getContent = function() {
      //todo: if multiline is false, only return contents of the paragraph
      return element.textContent 
    }
    return this;
  } 

  return OnionEditor;

});
