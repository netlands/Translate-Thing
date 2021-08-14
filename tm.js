const db = require('better-sqlite3')('tm.db');
var fs = require('fs');
var filename = "contents.txt";

var content;
fs.readFile(filename, 'utf8', function(err, data) {
  if (err) throw err;
  console.log('OK: ' + filename);
  content = data;

  var regex = /^([A-Za-z\-/ ]+): (.+)$/gm;
  var result;
  
  while((result = regex.exec(content)) !== null) {
    let name = result[1].trim();
    let typex = "property";
    const row = db.prepare('SELECT * FROM glossary WHERE en = ? COLLATE NOCASE').get(name);
    if (row !== undefined) {
      if (row.type == "property") {
        console.log(row.ja);
      }
    }
    let value = result[2].trim();
    console.log(name," : ",value);
  }
});


/*
const row = db.prepare('SELECT * FROM glossary WHERE en = ? COLLATE NOCASE').get('tEst');
const rows = db.prepare('SELECT * FROM glossary WHERE type = ?').all('color');
if (row !== undefined) {
    console.log(row.en,row.ja,rows.length);
}
console.log(rows);
const terms = db.prepare('SELECT * FROM glossary');

for (const term of terms.iterate()) {
  if (term.ja === '道行') {
    console.log(term.en, term.type);
    // break;
  }
}
*/

// db.close();