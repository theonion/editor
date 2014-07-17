define('onion-editor',[
  'scribe',
  'scribe-plugin-blockquote-command',
  'scribe-plugin-curly-quotes',
  'scribe-plugin-formatter-plain-text-convert-new-lines-to-html',
  'scribe-plugin-heading-command',
  'scribe-plugin-intelligent-unlink-command',
  'scribe-plugin-keyboard-shortcuts',
  'scribe-plugin-link-ui',
  'scribe-plugin-sanitizer',
  'scribe-plugin-smart-lists',
  'scribe-plugin-toolbar',
  'scribe-plugin-inline-objects',
  'scribe-plugin-betty-cropper',
  'scribe-plugin-youtube',
  'scribe-plugin-embed',
  'scribe-plugin-onion-video',
  'scribe-plugin-hr',
  'scribe-plugin-placeholder',
  'link-formatter'
], function (
  Scribe,
  scribePluginBlockquoteCommand,
  scribePluginCurlyQuotes,
  scribePluginFormatterPlainTextConvertNewLinesToHtml,
  scribePluginHeadingCommand,
  scribePluginIntelligentUnlinkCommand,
  scribePluginKeyboardShortcuts,
  scribePluginLinkUI,
  scribePluginSanitizer,
  scribePluginSmartLists,
  scribePluginToolbar,
  scribePluginInlineObjects,
  scribePluginBettyCropper,
  scribePluginYoutube,
  scribePluginEmbed,
  scribePluginOnionVideo,
  scribePluginHr,
  scribePluginPlaceholder,
  linkFormatter
) {

  'use strict';

  var defaults = {
    multiline: true,
    formatting: ['link', 'bold', 'italic', 'blockquote', 'heading', 'list'],
    link: {
      domain: 'avclub.com'
    },
    video: {
      videoEmbedUrl: "http://example.com?videoid=",
      insertDialog: function() {  },
      editDialog: function() {  }
    },
    image: {
      insertDialog: function() {  },
      editDialog: function() {  }
    }
  }

  function OnionEditor(element, options) {

    options = $.extend(defaults, options);



    var scribe = new Scribe(element, { allowBlockElements: options.multiline });      

    if (options.onChange) {
      scribe.on('content-changed', options.onChange);
    }

    if (options.placeholder) {
      scribe.use(scribePluginPlaceholder(options.placeholder));
    }

    var keyCommands = {};
    var ctrlKey = function (event) { return event.metaKey || event.ctrlKey; };

    // Allowable Tags
    var tags = {}, ignoredTags = {};
    
    // Multiline
    if (options.multiline) {
      tags.p = {};
      tags.br = {};
      tags.hr = {};

      ignoredTags.div = { class:'inline' } //ignore the contents of any div
    }

    // Bold
    if (options.formatting.indexOf('bold') !== -1) {
      keyCommands.bold = function (event) { return event.metaKey && event.keyCode === 66; }; // b
      tags.b = {};
    }

    // Italics
    if (options.formatting.indexOf('italic') !== -1) {
      keyCommands.italic = function (event) { return event.metaKey && event.keyCode === 73; }; // i
      tags.i = {};
      tags.em = {};
    }

    // Strike
    if (options.formatting.indexOf('strike') !== -1) {
      keyCommands.strikeThrough = function (event) { return event.altKey && event.shiftKey && event.keyCode === 83; }; // s
      tags.s = {};
    }

    //Remove formatting... 
    keyCommands.removeFormat = function (event) { return event.altKey && event.shiftKey && event.keyCode === 65; }; // a

    // Links
    if (options.multiline && options.formatting.indexOf('link') !== -1) {
      keyCommands.linkUI = function (event) { return event.metaKey && ! event.shiftKey && event.keyCode === 75; }; // k
      keyCommands.unlink = function (event) { return event.metaKey && event.shiftKey && event.keyCode === 75; }; // k,
      scribe.use(scribePluginIntelligentUnlinkCommand());
      scribe.use(scribePluginLinkUI(options.link));
      scribe.use(linkFormatter(options.link));
      tags.a = { href:true, target:true }
    }

    // Lists
    if (options.multiline && options.formatting.indexOf('list') !== -1) {
      keyCommands.insertUnorderedList = function (event) { return event.altKey && event.shiftKey && event.keyCode === 66; }; // b
      keyCommands.insertOrderedList = function (event) { return event.altKey && event.shiftKey && event.keyCode === 78; }; // n
      
      /* Disable for now. There's an open issue that needs to get resolved */
      //scribe.use(scribePluginSmartLists());
      tags.ol = {};
      tags.ul = {};
      tags.li = {};
    }

    //Blockquotes
    if (options.multiline && options.formatting.indexOf('blockquote') !== -1) {
      keyCommands.blockquote = function (event) { return event.altKey && event.shiftKey && event.keyCode === 87; }; // w
      scribe.use(scribePluginBlockquoteCommand());
      tags.blockquote = {};
    }

    // Headings
    if (options.multiline && options.formatting.indexOf('heading') !== -1) {
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

      scribe.use(scribePluginBettyCropper(options.image));
      scribe.use(scribePluginYoutube());
      scribe.use(scribePluginEmbed());
      scribe.use(scribePluginHr());
      scribe.use(scribePluginOnionVideo(options.video));
    }

    scribe.use(scribePluginSanitizer({
      tags: tags,
      ignoredTags: ignoredTags
    }));


    scribe.updateContents = function(fn) {
        setTimeout(function() {
          scribe.el.focus();
          setTimeout(function() {
            scribe.transactionManager.run(fn)
          }, 20);
        }, 20);
      }

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

      var contents = scribe.getContent();

      // Allow any plugins to clean up markup. Main use case is for embed plugin, atm.
      return contents;
    }

    this.scribe = scribe;
    return this;
  } 

  return OnionEditor;

});
