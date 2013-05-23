var express = require('express');
var app = express();
var tidy = require('htmltidy').tidy;
var querystring = require('querystring');
var lessMiddleware = require('less-middleware');


app.engine('.html', require('ejs').__express);

app.set('views', __dirname + '/views');
app.set('static dir', __dirname + '/static');
app.use(express.static( app.set('static dir') ));
app.use(express.bodyParser());


app.configure(function(){
  //other configuration here...
  app.use(lessMiddleware({
    src      : __dirname + "/static/css",
    compress : true
  }));
  app.use(express.static(__dirname + '/static/css'));
});

// This avoids having to provide the 
// extension to res.render()
app.set('view engine', 'html');

var documents = {
  'american-apparel': { title: 'Death by sexy: a middle-aged man in an Eat Pray Love promotional T-shirt auditions to be an American Apparel model', file: '/test/american-apparel.html' },
  'american-apparel-ascii': { name: 'ASCII Am Appy', file: '/test/american-apparel-ascii.html' },
};





app.get('/', function(req, res){
  res.render('index.html', {
    documents: documents
  });
});

app.get('/image-browser', function(req, res){
  res.render('image-browser.html', {
  });
});

app.get('/image.JSON', function(req, res){
    var imageData = [];
    for (var i = 21723; i < 21775; i++) {
        imageData.push(i);
    }
    //hardcode some image data
    var data = JSON.stringify(imageData)

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', data.length);
    res.write(data);
});



app.get("/doc/:slug.json", function (req, res) {
    var slug =  req.param('slug');
    fs = require('fs')
    var contents ="<p></p>";
    content = fs.readFileSync(__dirname + documents[slug].file, 'utf8');
    
    var data = JSON.stringify({
        slug: slug,
        title: documents[slug].title,
        content: content
    })

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', data.length);

    res.write(data);

});

app.get('/doc/:slug', function(req, res){
    res.render('document.html', {
        slug: req.param('slug'),

    });
});

app.get('/preview/:slug', function(req, res){
    var slug =  req.param('slug');
    fs = require('fs')
    var contents ="<p></p>";
    content = fs.readFileSync(__dirname + documents[slug].file, 'utf8');
    
    res.render('preview.html', {
        title: documents[slug].title,
        body: content
    });
});


app.post('/save', function(req, res) {

    tidy(querystring.unescape(req.body.content), 
        {
            "output-encoding": "ascii",
            "show-body-only": true
        },
        function(err, html) {
            fs = require('fs')
            console.log(html);

            //fs.writeFileSync(__dirname + documents[req.body.slug].file, html,{encoding:'utf8'});
        }
    );
    var data = JSON.stringify({'status': 'ok'});
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', data.length);

    res.write(data);

});

app.listen(3000);
console.log('Listening on port 3000');