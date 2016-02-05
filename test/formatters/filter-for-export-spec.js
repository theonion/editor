'use strict';
define(['scribe', 'formatters/filter-for-export'], function (Scribe, FilterForExport) {
  describe('Filter For Export', function () {
    it('filters for export', function () {
      var element = document.createElement('div');
      var scribe = new Scribe(element, { allowBlockElements: true });
      scribe.use(new FilterForExport());

      scribe.setContent('<p>I am not filtered!</p>');
      expect(scribe.getContent()).toEqual('<p>I am not filtered!</p>');

      HTMLParagraphElement.prototype.filterForExport = function () {
        this.innerText = "I was filtered!";
      }

      scribe.setContent('<p>I am not filtered!</p>');
      expect(scribe.getContent()).toEqual('<p>I was filtered!</p>');

      delete HTMLParagraphElement.prototype.filterForExport;

      scribe.setContent('<p>I am not filtered!</p>');
      expect(scribe.getContent()).toEqual('<p>I am not filtered!</p>');
    });
  });
});
