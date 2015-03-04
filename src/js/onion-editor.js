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
  'link-formatter',
  'only-trailing-brs',
  'paste-strip-newlines',
  'paste-strip-nbsps',
  'paste-from-word',
  'paste-sanitize',
  'remove-a-styles',
  'strip-bold-in-headings',
  'scribe-plugin-anchor',
  // scribe core
  'our-ensure-selectable-containers',
  'enforce-p-elements'
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
  linkFormatter,
  onlyTrailingBrs,
  pasteStripNewlines,
  pasteStripNbsps,
  pasteFromWord,
  pasteSanitize,
  removeAStyles,
  stripBoldInHeadings,
  scribePluginAnchor,
  // scribe core
  ourEnsureSelectableContainers,
  enforcePElements
) {

  'use strict';

  var defaults = {
    multiline: true,
    formatting: ['link', 'bold', 'italic', 'blockquote', 'heading', 'list', 'underline'],
    link: {
      domain: 'avclub.com'
    },
    video: {
      videoEmbedUrl: 'http://example.com?videoid=',
      insertDialog: function() {  },
      editDialog: function() {  }
    },
    image: {
      insertDialog: function() {  },
      editDialog: function() {  }
    }
  };

  function OnionEditor(element, options) {
    options = $.extend(defaults, options);
    $('.inline', element).attr('contenteditable', 'false');
  
    var scribe = new Scribe(element, { allowBlockElements: options.multiline });      

    /* if a node running through the sanitizer passes this test, it won't get sanitized true */
    function skipSanitization(node) {
      return ($(node).is('div.inline'));
    };
    // HACK: we reset the default htmlFormatters 'normalize' because
    // they don't quite work with what we're doing and there's
    // apparently no other way to override/remove the offending ones.
    scribe._htmlFormatterFactory.formatters['normalize'] = [];
    if (scribe.allowsBlockElements()) {
      scribe.use(enforcePElements());
      scribe.use(ourEnsureSelectableContainers({skipElement: skipSanitization}));
    }

    // MO' HACKZ: We don't want to kill SPANS inside our inline divs
    var insertHTMLCommandPatch = new scribe.api.CommandPatch('insertHTML');
    insertHTMLCommandPatch.execute = function (value) {
      scribe.transactionManager.run(function () {
        scribe.api.CommandPatch.prototype.execute.call(this, value);

        sanitize(scribe.el);

        function sanitize(parentNode) {
          var treeWalker = document.createTreeWalker(parentNode, NodeFilter.SHOW_ELEMENT);
          var node = treeWalker.firstChild();
          if (!node) { return; }

          do {
            if (node.nodeName === 'SPAN' && node.className.indexOf('inline') === -1) {
              element.unwrap(parentNode, node);
            } else {
              /**
               * If the list item contains inline elements such as
               * A, B, or I, Chrome will also append an inline style for
               * `line-height` on those elements, so we remove it here.
               */
              node.style.lineHeight = null;

              // There probably wasn’t a `style` attribute before, so
              // remove it if it is now empty.
              if (node.getAttribute('style') === '') {
                node.removeAttribute('style');
              }
            }

            // Sanitize children
            sanitize(node);
          } while ((node = treeWalker.nextSibling()));
        }
      }.bind(this));
    };
    scribe.commandPatches.insertHTML = insertHTMLCommandPatch;

    // ENDHACK

    if (options.placeholder) {
      scribe.use(scribePluginPlaceholder(options.placeholder));
    }

    // For now, we need to patch some scribe commands, just in case.
    var boldCommand = new scribe.api.CommandPatch('bold');
    boldCommand.execute = function (value) {
      if (this.selection === undefined) {
        document.execCommand(this.commandName, false, value || null);
      } else {
        scribe.transactionManager.run(function () {
          document.execCommand(this.commandName, false, value || null);
        }.bind(this));
      }
    };
    scribe.commandPatches['bold'] = boldCommand;

    var italicCommand = new scribe.api.CommandPatch('italic');
    italicCommand.execute = function (value) {
      if (this.selection === undefined) {
        document.execCommand(this.commandName, false, value || null);
      } else {
        scribe.transactionManager.run(function () {
          document.execCommand(this.commandName, false, value || null);
        }.bind(this));
      }
    };
    scribe.commandPatches['italic'] = italicCommand;
    
    var underlineCommand = new scribe.api.CommandPatch('underline');
    underlineCommand.execute = function (value) {
      if (this.selection === undefined) {
        document.execCommand(this.commandName, false, value || null);
      } else {
        scribe.transactionManager.run(function () {
          document.execCommand(this.commandName, false, value || null);
        }.bind(this));
      }
    };
    scribe.commandPatches['underline'] = underlineCommand;
    // End horrible patches

    var keyCommands = {};
    var ctrlKey = function (event) { return event.metaKey || event.ctrlKey; };

    // Allowable Tags
    var tags = {};
    
    // Multiline
    if (options.multiline) {
      tags.p = {'id': true};
      tags.br = {};
      tags.hr = {};
    } else {
      // tags.br = {};
      // scribe.use(onlyTrailingBrs());
    }

    // Bold
    if (options.formatting.indexOf('bold') !== -1) {
      keyCommands.bold = function (event) { return event.metaKey && event.keyCode === 66; }; // b
      tags.b = {'id': true};
    }

    // Italics
    if (options.formatting.indexOf('italic') !== -1) {
      keyCommands.italic = function (event) { return event.metaKey && event.keyCode === 73; }; // i
      tags.i = {'id': true};
      tags.em = {'id': true};
    }

    // Strike
    if (options.formatting.indexOf('strike') !== -1) {
      keyCommands.strikeThrough = function (event) { return event.altKey && event.shiftKey && event.keyCode === 83; }; // s
      tags.s = {'id': true};
    }

    // Underline 
    if (options.formatting.indexOf('underline') !== -1) {
      keyCommands.underline = function (event) { return event.metaKey && event.keyCode === 85; }; // u
      tags.u = {'id': true};
    }

    // Remove formatting... 
    keyCommands.removeFormat = function (event) { return event.altKey && event.shiftKey && event.keyCode === 65; }; // a

    // Links
    if (options.multiline && options.formatting.indexOf('link') !== -1) {
      keyCommands.linkUI = function (event) { return event.metaKey && ! event.shiftKey && event.keyCode === 75; }; // k
      keyCommands.unlink = function (event) { return event.metaKey && event.shiftKey && event.keyCode === 75; }; // k,
      scribe.use(scribePluginIntelligentUnlinkCommand());
      scribe.use(scribePluginLinkUI(options.link));
      scribe.use(linkFormatter(options.link));
      tags.a = { href:true, target:true, id:true};
    }

    // Lists
    if (options.multiline && options.formatting.indexOf('list') !== -1) {
      keyCommands.insertUnorderedList = function (event) { return event.altKey && event.shiftKey && event.keyCode === 66; }; // b
      keyCommands.insertOrderedList = function (event) { return event.altKey && event.shiftKey && event.keyCode === 78; }; // n
      
      scribe.use(scribePluginSmartLists());
      tags.ol = {id:true};
      tags.ul = {id:true};
      tags.li = {id:true};
    }

    //Blockquotes
    if (options.multiline && options.formatting.indexOf('blockquote') !== -1) {
      keyCommands.blockquote = function (event) { return event.altKey && event.shiftKey && event.keyCode === 87; }; // w
      scribe.use(scribePluginBlockquoteCommand());
      tags.blockquote = {id:true};
    }

    // Headings
    if (options.multiline && options.formatting.indexOf('heading') !== -1) {
      keyCommands.h3 = function (event) { return ctrlKey(event) && event.keyCode === 50; }; // 2
      keyCommands.h4 = function (event) { return ctrlKey(event) && event.keyCode === 51; }; // 2
      scribe.use(scribePluginHeadingCommand(3));
      scribe.use(scribePluginHeadingCommand(4));
      tags.h3 = {id:true};
      tags.h4 = {id:true};
    }


    // Inline Objects
    if (options.multiline && options.inlineObjects) {
      scribe.use(scribePluginInlineObjects(options.inlineObjects));
      
      // Maybe make optionally load these similar to formatting. For now, it's an all or nothing.

      scribe.use(scribePluginBettyCropper(options.image));
      scribe.use(scribePluginYoutube());
      scribe.use(scribePluginEmbed());
      scribe.use(scribePluginHr());
      scribe.use(scribePluginAnchor());
      scribe.use(scribePluginOnionVideo(options.video));
      scribe.use(removeAStyles());
      scribe.use(stripBoldInHeadings());
    }

    scribe.use(scribePluginSanitizer({
      tags: tags,
      skipSanitization: skipSanitization
    }));
    scribe.use(pasteFromWord());
    scribe.use(pasteSanitize());
    scribe.use(pasteStripNewlines());
    scribe.use(pasteStripNbsps());
    // Word count 
    
    if (options.statsContainer) {
      setInterval(function () {
        $(options.statsContainer).html(
          $(scribe.el).text().split(' ').length
        );
      }, 3000);
    }


    /* This is necessary for a few dumb reasons. Scribe's transaction manager doesn't work when there 
      ins't a selection inside of the editor. This means any changes made when the editor ins't in focus,
      like adding an image, stuff breaks. This works around that particular issue. 

      I'm not really sure the right way to fix this or how to avoid this problem.

      The scroll stuff is a consequence of this. 
    */
    scribe.updateContents = function(fn, skipFormatters) {
      // Default is to skipFormatters. Only place this needs to be set to false is when updating links. 
      // We want formatters to run on links. Embeds & other shit seem to get sanitized 
      // despite there being safegaurds for that.
      if (typeof skipFormatters === 'undefined') {
        skipFormatters = true;
      }
      scribe._skipFormatters = skipFormatters;
      var scrollY = window.scrollY;
      setTimeout(function() {        
        scribe.el.focus();
        setTimeout(function() {
          scribe.transactionManager.run(fn);
          window.scrollTo(0, scrollY);

          // This should notify any changes that happen outside of typing 
          scribe.trigger('content-changed');
        }, 20);
      }, 20);
    };
    
    scribe.use(scribePluginCurlyQuotes());
    scribe.use(scribePluginKeyboardShortcuts(Object.freeze(keyCommands)));

    //TODO: kill this existing toolbar & replace w/ Medium style selection toolbar
    if (options.multiline) {
      scribe.use(scribePluginToolbar($('.document-tools .toolbar-contents', element.parentNode)[0]));
    }
    else {
      $('.document-tools .toolbar-contents', element.parentNode).hide();
    }

    // a little hacky to prevent deletion of images and other inline elements via the backspace key. 
    scribe.el.addEventListener('keydown', function(event) {
      if (event.keyCode === 8) {
        // is the previous immediate child of editor an inline item?
        var sel = new scribe.api.Selection();
        var prev = $(sel.selection.anchorNode).closest('.editor>*').prev();
        if (prev.hasClass('inline') 
          && sel.selection.anchorOffset === 0 
          && sel.selection.isCollapsed) {
          event.preventDefault();
        }
      }
    });

    scribe.use(scribePluginFormatterPlainTextConvertNewLinesToHtml());

    this.setChangeHandler = function(func) {
      scribe.on('content-changed', func); 
    };

    this.setContent = function(content) {
      if (!content) {
          content = '<p><br></p>';
      }
      scribe.setContent(content);
    };

    this.getContent = function() {
      //todo: if multiline is false, only return contents of the paragraph

      var contents = scribe.getContent();

      // Allow any plugins to clean up markup. Main use case is for embed plugin, atm.
      return contents;
    };

    this.scribe = scribe;
    return this;
  } 

  return OnionEditor;

});
