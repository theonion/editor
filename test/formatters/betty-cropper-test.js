'use strict';
define(['scribe', 'plugins/scribe-plugin-inline-objects', 'plugins/scribe-plugin-betty-cropper'], function(Scribe, inlinePlugin, bettyPlugin) {

  describe('Betty Cropper', function () {

    var scribe;   

    beforeEach(function () {
      var element = document.createElement('div');
      scribe = new Scribe(element, { allowBlockElements: true }); 
    });


  });

});