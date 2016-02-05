'use strict';
define(['scribe', 'formatters/filter-for-export'], function (Scribe, FilterForExport) {
  describe('Filter For Export', function () {
    it('filters for export', function () {
      var element = document.createElement('div');
      var scribe = new Scribe(element, { allowBlockElements: true });
      scribe.use(new FilterForExport());
      scribe.setContent('<p>I am not filtered!</p>');
      
      // First, check that default filtering does not alter the content.
      expect(scribe.getContent()).toEqual('<p>I am not filtered!</p>');

      // Abuse the poor <p> tag prototype for testing purpsoses.
      HTMLParagraphElement.prototype.filterForExport = function () {
        this.innerText = "I was filtered!";
      }

      // Note that the content is filtered.
      expect(scribe.getContent()).toEqual('<p>I was filtered!</p>');

      // Restore order to the universe.
      delete HTMLParagraphElement.prototype.filterForExport;

      // And confirm the content in the editor was not damaged.
      expect(scribe.getContent()).toEqual('<p>I am not filtered!</p>');
    });
  });
});
