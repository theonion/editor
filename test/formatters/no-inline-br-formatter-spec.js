'use strict';
define(['scribe', 'formatters/scribe-plugin-no-inline-br'], function(Scribe, NoInlineBrFormatter) {

  describe('No-inline-BR formatter', function () {

    var scribe;   
    var formatter;

    beforeEach(function () {
      var element = document.createElement('div');
      scribe = new Scribe(element, { allowBlockElements: true });
      formatter = new NoInlineBrFormatter();
      scribe.use(formatter);
    });

    function testInput(inHtml, outHtml) {
      return function () {
        expect(scribe._htmlFormatterFactory.format(inHtml)).toEqual(outHtml);
      };
    }

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
    it('gets rid of inline brs 2', testInput(
      '<p>Something<b><br> something<br></b> some more</p><p>more</p>',
      '<p>Something<b> something</b> some more</p><p>more</p>'
    ));
  });

});