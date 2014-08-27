'use strict';
define([
  'scribe',
  'jquery',
  'onion-editor',
  'jasmine-jquery'], function (Scribe, jquery, OnionEditor, jasmineJquery) {

  describe('Onion Editor', function () {

    var editor;   

    beforeEach(function () {
      jasmine.getFixtures().fixturesPath = '/base/test/fixtures';
      loadFixtures('singleline-onion-editor.html');
      editor = new OnionEditor(document.getElementById('editor'), {
        inlineObjects: '/base/public/inline-config.json', 
        multiline: false, 
        placeholder: {
          text: 'Single-line input',
          container: document.getElementsByClassName('editorPlaceholder')[0]
        },
        statsContainer: '.wordcount'
      });
      editor.setChangeHandler(function() {  });
    });

    it('loads up a-ok', function(){

    });

    function testInput(inHtml, outHtml) {
      return function (done) {
        editor.setContent(inHtml);
        setTimeout(function () {
          expect(editor.getContent()).toEqual(outHtml);
          done();
        }, 30);
      };
    }

    // inline-brs and empty inline element integration tests

    it('removes br', testInput(
      '<br>', ''
    ));
    it('removes brs', testInput(
      'This is a horrible feature<br>stuff<br>', 'This is a horrible featurestuff'
    ));
    it('it removes inline brs', testInput(
      'Text and such<br/>Text and such',
      'Text and suchText and such'
    ));

  });
});