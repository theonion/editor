'use strict';
define(['scribe', 'formatters/link-formatter'], function(Scribe, LinkFormatter) {

  describe('Link formatter', function () {

    var scribe;   

    beforeEach(function () {
      var element = document.createElement('div');
      scribe = new Scribe(element, { allowBlockElements: true }); 
    });

    it('corrects non-existent schemes', function () {
      
      scribe.use(new LinkFormatter({domain: 'example2.com'}));
      // console.log(formatter);
      var html = '<p><a href="example.com">Testing</a></p>';
      
      expect(scribe._htmlFormatterFactory.format(html)).toBe('<p><a href="http://example.com">Testing</a></p>');
    });

    it('makes links relative', function () {
      scribe.use(new LinkFormatter({domain: 'example.com'}));

      expect(scribe._htmlFormatterFactory.format(
        '<p><a href="http://example.com/tv/">Testing</a></p>')
      ).toBe('<p><a href="/tv/">Testing</a></p>');

      expect(scribe._htmlFormatterFactory.format(
        '<p><a href="example.com/tv/">Testing</a></p>')
      ).toBe('<p><a href="/tv/">Testing</a></p>');
    });

    it('handles a tags with no href', function () {
      scribe.use(new LinkFormatter({domain: 'example.com'}));
      var body = '<p><a>Some heading or something</a></p>';
      expect(scribe._htmlFormatterFactory.format(body)).toEqual(body);
    });
  });

});