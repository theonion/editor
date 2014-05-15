/*
require.config({
  paths: {
    'scribe': './bower_components/scribe/scribe',
    'scribe-plugin-blockquote-command': './bower_components/scribe-plugin-blockquote-command/scribe-plugin-blockquote-command',
    'scribe-plugin-curly-quotes': './bower_components/scribe-plugin-curly-quotes/scribe-plugin-curly-quotes',
    'scribe-plugin-formatter-plain-text-convert-new-lines-to-html': './bower_components/scribe-plugin-formatter-plain-text-convert-new-lines-to-html/scribe-plugin-formatter-plain-text-convert-new-lines-to-html',
    'scribe-plugin-heading-command': './bower_components/scribe-plugin-heading-command/scribe-plugin-heading-command',
    'scribe-plugin-intelligent-unlink-command': './bower_components/scribe-plugin-intelligent-unlink-command/scribe-plugin-intelligent-unlink-command',
    'scribe-plugin-keyboard-shortcuts': './bower_components/scribe-plugin-keyboard-shortcuts/scribe-plugin-keyboard-shortcuts',
    'scribe-plugin-link-prompt-command': './bower_components/scribe-plugin-link-prompt-command/scribe-plugin-link-prompt-command',
    'scribe-plugin-sanitizer': './bower_components/scribe-plugin-sanitizer/scribe-plugin-sanitizer',
    'scribe-plugin-smart-lists': './bower_components/scribe-plugin-smart-lists/scribe-plugin-smart-lists',
    'scribe-plugin-toolbar': './bower_components/scribe-plugin-toolbar/scribe-plugin-toolbar',
    'scribe-plugin-inline-objects': '../src/plugins/scribe-plugin-inline-objects',
    'scribe-plugin-inline-objects-toolbar': '../src/plugins/scribe-plugin-inline-objects-toolbar',

  }
});
*/

require([
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

  var scribe = new Scribe(document.querySelector('.scribe'), { allowBlockElements: true });

  scribe.on('content-changed', updateHTML);

  function updateHTML() {
    document.querySelector('.scribe-html').textContent = scribe.getHTML();
  }

  /**
   * Keyboard shortcuts
   */

  var ctrlKey = function (event) { return event.metaKey || event.ctrlKey; };

  var commandsToKeyboardShortcutsMap = Object.freeze({
    bold: function (event) { return event.metaKey && event.keyCode === 66; }, // b
    italic: function (event) { return event.metaKey && event.keyCode === 73; }, // i
    strikeThrough: function (event) { return event.altKey && event.shiftKey && event.keyCode === 83; }, // s
    removeFormat: function (event) { return event.altKey && event.shiftKey && event.keyCode === 65; }, // a
    linkPrompt: function (event) { return event.metaKey && ! event.shiftKey && event.keyCode === 75; }, // k
    unlink: function (event) { return event.metaKey && event.shiftKey && event.keyCode === 75; }, // k,
    insertUnorderedList: function (event) { return event.altKey && event.shiftKey && event.keyCode === 66; }, // b
    insertOrderedList: function (event) { return event.altKey && event.shiftKey && event.keyCode === 78; }, // n
    blockquote: function (event) { return event.altKey && event.shiftKey && event.keyCode === 87; }, // w
    h3: function (event) { return ctrlKey(event) && event.keyCode === 50; }, // 2
    h4: function (event) { return ctrlKey(event) && event.keyCode === 51; }, // 2
  });

  /**
   * Plugins
   */

  scribe.use(scribePluginBlockquoteCommand());
  scribe.use(scribePluginHeadingCommand(3));
  scribe.use(scribePluginHeadingCommand(4));

  scribe.use(scribePluginIntelligentUnlinkCommand());
  scribe.use(scribePluginLinkPromptCommand());
  scribe.use(scribePluginToolbar(document.querySelector('.document-tools .toolbar-contents')));
  //scribe.use(scribePluginInlineObjectToolbar(document.querySelector('.inline-object-toolbar')));
  scribe.use(scribePluginSmartLists());
  scribe.use(scribePluginCurlyQuotes());
  scribe.use(scribePluginKeyboardShortcuts(commandsToKeyboardShortcutsMap));


  //TODO: Pass in inline object configuration
  scribe.use(scribePluginInlineObjects(
    {
      "image": {
          "template":
          "<div data-type=\"image\" data-crop=\"{{crop}}\" class=\"inline embed size-{{size}} crop-{{crop}}\" data-url=\"{{source}}\"><img src=\"{{url}}\"></div>"
      },
      "embed": {
          "size": ["big", "small"],
          "crop": ["original","16x9", "4x3"],
          "defaults": {
              "size":"big",
              "crop": "16x9"
          },
          "template": 
          "<div data-type=\"embed\" data-crop=\"{{crop}}\" class=\"inline embed size-{{size}} crop-{{crop}}\" data-source=\"{{source}}\"><div>{{embed_code}}</div><span class=\"caption\">{{caption}}</span><a class=\"source\" target=\"_blank\" href=\"{{source}}\">Source</a></div>"
      }
    }));
  // Formatters
  scribe.use(scribePluginSanitizer({
    tags: {
      p: {},
      br: {},
      b: {},
      strong: {},
      i: {},
      s: {},
      blockquote: {},
      ol: {},
      ul: {},
      li: {},
      a: { href: true },
      h3: {},
      h4: {}
    }
  }));
  scribe.use(scribePluginFormatterPlainTextConvertNewLinesToHtml());

  if (scribe.allowsBlockElements()) {
    scribe.setContent('<p>Hello, World!</p>');
  } else {
    scribe.setContent('Hello, World!');
  }
});
