var express = require('express');
var app = express();
var path = require('path');
const db = require('better-sqlite3')('tm.db');

// set the view engine to ejs
app.set('view engine', 'ejs');
// use res.render to load up an ejs view file
app.use(express.static("public"));


// prepare server

app.use('/', express.static(__dirname + '/www')); // redirect root
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

// index page
app.get('/', function (req, res) {
  res.render('page/index', {
    result_from_database: res.body
  });
});

app.listen(3000, function () {
  console.log('App listening on port 3000!');
});

app.get('/api/translate', function (req, res) {
  //console.log(req.query);
  res.json({
    message: translateString(req.query.original)
  });
});

function translateString(original) {
  content = original;
  // console.log(content);
  var regex = new RegExp(/^([A-Za-z\-/ ]+): (.+)$/gm);
  var result, translation;
  translations = "";

  while ((result = regex.exec(content)) !== null) {
    let name = result[1].trim();
    let value = result[2].trim();
    console.log(name, " : ", value);

    translation = "";
    const row = db.prepare('SELECT * FROM glossary WHERE en = ? COLLATE NOCASE').get(name);
    if (row !== undefined) {
      if (row.type == "property") {
        translation = row.ja;
      }
    } else {
      translation = name;
    }

    translation = translation + "：";

    const row2 = db.prepare('SELECT * FROM glossary WHERE en = ? COLLATE NOCASE').get(value);
    if (row2 !== undefined) {
      translation = translation + row2.ja + "\n";
    } else {
      translation = translation + value + "\n"
    }

    translations = translations + translation

  }
  return translations
}