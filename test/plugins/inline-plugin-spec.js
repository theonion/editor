'use strict';
define(['scribe', 'jquery', 'plugins/scribe-plugin-inline-objects'], function(Scribe, jquery, InlinePlugin) {

  describe('Inline plugin', function () {

    var scribe;   

    beforeEach(function () {
      jquery('body').append('<div class="scribe"></div>');
      scribe = new Scribe(jquery('.scribe')[0], { allowBlockElements: true }); 
    });

    it('should load a dict config', function () {
      var plugin = new InlinePlugin({
        'hr': {
          'template': '<div class="hr inline" contenteditable="false"><hr></div>'
        }
      });
      scribe.use(plugin);
    });

    it('should load an external config', function(){
      var plugin = new InlinePlugin('/base/test/templates/config.json');
      scribe.use(plugin);
    });
  });
});