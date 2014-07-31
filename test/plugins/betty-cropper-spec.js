'use strict';
define([
  'scribe',
  'jquery',
  'plugins/scribe-plugin-inline-objects',
  'plugins/scribe-plugin-betty-cropper'], function(Scribe, jquery, scribePluginInlineObjects, scribePluginBettyCropper) {

  describe('Inline plugin', function () {

    var scribe;   

    beforeEach(function () {
      jquery('body').append('<div class="scribe"></div>');
      scribe = new Scribe(jquery('.scribe')[0], { allowBlockElements: true }); 
    });

    it('should load properly', function () {
      scribe.use(scribePluginInlineObjects({
        'image': {
          'size': ['huge', 'big', 'medium', 'small', 'small-centered', 'tiny'],
          'crop': ['original', '16x9', '1x1', '3x1'],
          'defaults': {
            'size': 'big',
            'crop': 'original',
            'image_id': 0,
            'caption': '',
            'url': ''
          },
          'template':
          '<div data-type="image" contenteditable="false" class="onion-image image inline size-{{size}} crop-{{crop}}" data-image-id="{{image_id}}" data-size="{{size}}" data-crop="{{crop}}"> <div></div><span class="caption">{{caption}}</span></div>'
        }
      }));
      scribe.use(scribePluginBettyCropper({
          insertDialog: function () {
          var promise = new Promise(function (resolve) { resolve({
              'name': 'Lenna.png',
              'width': 512,
              'selections': {
                '16x9': {'y1': 400, 'y0': 112, 'x0': 0, 'x1': 512, 'source': 'auto'},
                '3x1': {'y1': 341, 'y0': 171, 'x0': 0, 'x1': 512, 'source': 'auto'},
                '1x1': {'y1': 512, 'y0': 0, 'x0': 0, 'x1': 512, 'source': 'auto'},
                '3x4': {'y1': 512, 'y0': 0, 'x0': 64, 'x1': 448, 'source': 'auto'},
                '2x1': {'y1': 384, 'y0': 128, 'x0': 0, 'x1': 512, 'source': 'auto'},
                '4x3': {'y1': 448, 'y0': 64, 'x0': 0, 'x1': 512, 'source': 'auto'}
              },
              'height': 512,
              'credit': null,
              'id': 1
            })});
            return promise;
          },
          editDialog: function(){

          }
      }));
      scribe.trigger('inline:insert:image');
    });
  });
});