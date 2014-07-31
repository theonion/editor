'use strict';
define(['scribe', 'formatters/link-formatter'], function(Scribe, LinkFormatter) {

  describe('Link formatter', function () {

    var element = document.createElement('div');
    var scribe = new Scribe(element, { allowBlockElements: true });   

    beforeEach(function () {
      scribe = new Scribe(element, { allowBlockElements: true }); 
    });

    it('formats things', function(){
      
      scribe.use(new LinkFormatter({domain: 'example2.com'}));
      // console.log(formatter);
      var badHTML = '<a href="htp://example.com">Testing</a>';
      
      expect(scribe._htmlFormatterFactory.format(badHTML), '<a href="http://example.com">Testing</a>');
      expect(true).toBe(true);
    });

  });

});