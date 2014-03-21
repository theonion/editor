/* 

Image 

This bridges the embed module that the editor exposes & our custom image implementation. 

*/

(function(global) {
    'use strict';
    var OnionImage = OnionImage || function(editor, options) {

        window.IMAGE_URL = "//img.onionstatic.com/avclub/{{id}}/{{crop}}/{{width}}.jpg"
        var embedMarkup = 
            '<div data-picture class="image inline placeholder {{position}} {{crop}}"  data-image-id="{{id}}" data-image-alt="" contenteditable="false">\
                <div>\
                    <noscript><img src="//img.onionstatic.com/avclub/{{id}}/original/300.jpg"></noscript>\
                </div>\
            </div>'
 


        function getImageID() {
            // CMS CONNECTION POINT
            return $("#image-embed-id").val()
        }


        editor.on("embed:image", start);    


        function start() {
            //CMS Connection point
            populateDrawer("embed-panel-image");
            // register events for buttons
            $(".image-place a").bind("mouseover", previewItem)
            $(".image-place a").bind("mouseout", clearItem)
            $(".image-place a").bind("click", placeItem)
            openDrawer();
        }

        function clearItem() {
            $(".placeholder", editor.element).remove();
        }
        function previewItem() {
            var node = editor.selection.getTopLevelParent();
            if (node) {
                
                //re-render images
                
                console.log(editor);
                $(node).before( 
                    editor.utils.template(embedMarkup, {id: getImageID(), position: this.name, crop:''})
                );
            }
            else {
                node = $(".editor",options.element);
            }
            window.picturefill();

        }


        function placeItem(type) {
            $(".placeholder", editor.element).removeClass("placeholder");
             window.picturefill();
        }

        editor.embed.types.push('image'); // register as embeddable type
    }
    global.EditorModules.push(OnionImage);
})(this)