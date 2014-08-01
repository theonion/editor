'use strict';
define([
  'scribe',
  'jquery',
  'onion-editor'], function(Scribe, jquery, onionEditor) {

  describe('Onion Editor', function () {

    var scribe;   

    beforeEach(function () {
      jquery('body').append('<div class="scribe"></div>');
      scribe = new Scribe(jquery('.scribe')[0], { allowBlockElements: true }); 
    });

    


  });
});