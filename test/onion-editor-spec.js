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
    it('gets rid of inline brs', testInput(
      '<p>Something<b> something<br></b></p><p>more</p>',
      '<p>Something<b> something</b></p><p>more</p>'
    ));
    it('removes invisible inline brs', testInput(
      '<ul><li><b><br></b></li></ul>',
      '<ul><li><br></li></ul>'
    ));
    it('removes empty inline elements', testInput(
      '<p>Some text<b></b></p>', '<p>Some text</p>'
    ));
    it('removes empty inline elements and leaves stuff ok', testInput(
      '<p><b></b></p>',
      '<p><br></p>'
    ));
    it('removes empty inline italics', testInput(
      '<p><i></i></p>',
      '<p><br></p>'
    ));
    it('removes empty inline underlining', testInput(
      '<p><u></u></p>',
      '<p><br></p>'
    ));
    it('allow inline underlining', testInput(
      '<p><u>test</u></p>',
      '<p><u>test</u></p>'
    ));
    it('does not mess up links', testInput(   
      '<p><a href="http://www.clickhole.com/">Clickhole</a></p>',
      '<p><a href="http://www.clickhole.com/">Clickhole</a></p>'
    ));
    it('does not mess up links with brs', testInput(   
      '<p><a href="http://www.clickhole.com/"><br>Clickhole<br></a></p>',
      '<p><a href="http://www.clickhole.com/">Clickhole</a></p>'
    ));
    it('it removes empty links', testInput(
      '<p><a href="http://www.cmon.com/"></a></p>',
      '<p><br></p>'
    ));

    // link formatter integration

    it('it removes empty links', testInput(
      '<p><a href="http://www.cmon.com/"></a></p>',
      '<p><br></p>'
    ));
    it('it makes local links relative', testInput(
      '<p><a href="http://example.com/tv/">Testing</a></p>',
      '<p><a href="/tv/">Testing</a></p>'
    ));
    it('it handles protocol-less relative links', testInput(
      '<p><a href="example.com/tv/">Testing</a></p>',
      '<p><a href="/tv/">Testing</a></p>'
    ));
    it('handles a tags with no href', testInput(
      '<p><a>Some heading or something</a></p>',
      '<p><a>Some heading or something</a></p>'
    ));
    it('handles mailto: links', testInput(
      '<p><a href="mailto:webtech@theonion.com">Send us an email</a></p>',
      '<p><a href="mailto:webtech@theonion.com">Send us an email</a></p>'
    ));

    // inline objects

    it('plays well with inline images', testInput(
      '<div data-type="image" class="inline buncha-classes" data-image-id="5" data-size="big" data-crop="16x9" contenteditable="false"><div></div><span class="caption"></span></div>',
      '<div data-type="image" class="inline buncha-classes" data-image-id="5" data-size="big" data-crop="16x9" contenteditable="false"><div></div><span class="caption"></span></div>'
    ));
    it('plays well with blockquote', testInput(
      '<blockquote><p>Quin etiam ipsi voluptarii deverticula quaerunt et virtutes habent in ore totos dies voluptatemque primo dumtaxat expeti dicunt, deinde consuetudine quasi alteram quandam naturam effici, qua inpulsi multa faciant nullam quaerentes voluptatem.</p></blockquote>',
      '<blockquote><p>Quin etiam ipsi voluptarii deverticula quaerunt et virtutes habent in ore totos dies voluptatemque primo dumtaxat expeti dicunt, deinde consuetudine quasi alteram quandam naturam effici, qua inpulsi multa faciant nullam quaerentes voluptatem.</p></blockquote>'
    ));

    // nbsps

    it('removes all these horrible nbsps', testInput(
      '<p>Like many children who grew up in the early ’90s,&nbsp;<b>Robin Williams was a constant in my life.</b>&nbsp;Movies like&nbsp;<i>Hook, Mrs. Doubtfire, Jumanji</i><i>&nbsp;<br></i>and&nbsp;<i>The Birdcage</i><i>&nbsp;<br></i>(an odd childhood favorite of mine; I had progressive parents) were in constant rotation on TV or VHS. Williams’ voice work in&nbsp;<i>Aladdin</i></p>',
      '<p>Like many children who grew up in the early ’90s, <b>Robin Williams was a constant in my life.</b> Movies like <i>Hook, Mrs. Doubtfire, Jumanji</i> and <i>The Birdcage</i> (an odd childhood favorite of mine; I had progressive parents) were in constant rotation on TV or VHS. Williams’ voice work in <i>Aladdin</i></p>'
    ));
  
  });
});
