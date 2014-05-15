define('scribe-plugin-test',[],function () {

  return function () {
    return function (scribe) {


        //scribe.commands.insertHTML("fart");

        console.log(scribe.commands);
        setTimeout(function() {
          scribe.commands.insertHTML.execute("<B>FART</B>");
        }, 4000);

      };
    }
});