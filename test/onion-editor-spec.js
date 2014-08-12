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
        inlineObjects: '/base/public/inline-config.json', 
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

    it('does not remove too many brs', testInput(
      '<p><br></p>', '<p><br></p>'
    ));
    it('does not remove too many brs 2', testInput(
      '<p>Text and such</p><p><br></p><p>Text and such</p>',
      '<p>Text and such</p><p><br></p><p>Text and such</p>'
    ));
    it('does not remove brs in lists', testInput(
      '<ul><li><br></li></ul>', '<ul><li><br></li></ul>'
    ));

    // inline objects

    it('plays well with inline images', testInput(
      '<div data-type="image" class="inline buncha-classes" data-image-id="5" data-size="big" data-crop="16x9" contenteditable="false"><div></div><span class="caption"></span></div>',
      '<div data-type="image" class="inline buncha-classes" data-image-id="5" data-size="big" data-crop="16x9" contenteditable="false"><div></div><span class="caption"></span></div>'
    ));
    it('plays well with inline images that have captions', testInput(
      '<div data-type="image" class="inline buncha-classes" data-image-id="5" data-size="big" data-crop="16x9" contenteditable="false"><div></div><span class="caption">A &amp; W</span></div>',
      '<div data-type="image" class="inline buncha-classes" data-image-id="5" data-size="big" data-crop="16x9" contenteditable="false"><div></div><span class="caption">A &amp; W</span></div>'
    ));
    it('plays well with blockquote', testInput(
      '<blockquote><p>Quin etiam ipsi voluptarii deverticula quaerunt et virtutes habent in ore totos dies voluptatemque primo dumtaxat expeti dicunt, deinde consuetudine quasi alteram quandam naturam effici, qua inpulsi multa faciant nullam quaerentes voluptatem.</p></blockquote>',
      '<blockquote><p>Quin etiam ipsi voluptarii deverticula quaerunt et virtutes habent in ore totos dies voluptatemque primo dumtaxat expeti dicunt, deinde consuetudine quasi alteram quandam naturam effici, qua inpulsi multa faciant nullam quaerentes voluptatem.</p></blockquote>'
    ));

  });
});
