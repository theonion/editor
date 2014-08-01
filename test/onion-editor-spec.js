'use strict';
define([
  'scribe',
  'jquery',
  'onion-editor',
  'jasmine-jquery'], function(Scribe, jquery, OnionEditor, jasmineJquery) {

  describe('Onion Editor', function () {

    var editor;   

    beforeEach(function () {
      jasmine.getFixtures().fixturesPath = '/base/test/fixtures';
      loadFixtures('onion-editor.html');
      editor = new OnionEditor(document.getElementById('editor'), {
        inlineObjects: '/public/inline-config.json', 
        multiline:true, 
        placeholder: {
          text: '<p>WRITE HERE, COWBOY</p>',
          container: document.getElementsByClassName('editorPlaceholder')[0]
        },
        statsContainer: '.wordcount',
        link: {
          domain: 'example.com',
          searchHandler: function(term, resultsElement) {
            resultsElement.html('<b>' + term + '</b><br><a href="/fart/"><i>Fart</i> Fart</a><br><a href="/butt/"><i>Fart</i>  Butt</a><br><a href="/dumb/"><i>Fart</i> Dumb</a><br>');
          }
        }
      });
      editor.setChangeHandler(function() {  });
    });

    it('loads up a-ok', function(){

    });
  });
});