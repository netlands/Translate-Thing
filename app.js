var express = require('express');
var app = express();
var path = require('path');
const db = require('better-sqlite3')('tm.db');
const open = require('open');

// set the view engine to ejs
app.set('view engine', 'ejs');
// use res.render to load up an ejs view file
app.use(express.static("public"));

// prepare server
app.use('/', express.static(__dirname + '/www')); // redirect root
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/js', express.static(__dirname + '/node_modules/gridjs/dist')); // redirect gridjs
app.use('/css', express.static(__dirname + '/node_modules/gridjs/dist/theme')); // redirect gridjs

// index page
app.get('/', function (req, res) {
	res.render('page/index', {
		result_from_database: res.body
	});
});

// start server
app.listen(3000, function () {
	console.log('App active on http://127.0.0.1:3000 and http://' + getLocalIp() + ':3000');
	open('http://127.0.0.1:3000');
});


app.get('/api/translate', function (req, res) {
	//console.log(req.query);
	res.json({
		translation: translateString(req.query.original)
	});
});


app.get('/api/addterm', function (req, res) {
	// console.log(req.query);
	addTerm(req.query.en, req.query.ja, req.query.furigana, req.query.romaji, req.query.ja2, req.query.en2, req.query.context, req.query.type, req.query.note);
	res.json({
		message: "term added"
	});
});

app.get('/api/getterm', function (req, res) {
	// http://127.0.0.1:3000/api/getterm?term=silk
	const stmt = db.prepare('SELECT * FROM glossary WHERE en = ? OR en2 = ? OR romaji = ?');
	const row = stmt.get(req.query.term, req.query.term, req.query.term);

	if (row === undefined) {
		const stmt2 = db.prepare('SELECT * FROM glossary WHERE ja = ? OR ja2 = ? OR furigana = ?');
		const row2 = stmt2.get(req.query.term, req.query.term, req.query.term);
		if (row2 === undefined) {
			res.json({
				translation: "NO MATCH"
			});
		} else {
			res.json({
				translation: row2.en
			});
		}

	} else {
		res.json({
			translation: row.ja
		});
	}
});

app.get('/api/getrows', function (req, res) {
	// http://127.0.0.1:3000/api/getterm?term=silk
	const stmt = db.prepare('SELECT * FROM glossary WHERE en = ? OR en2 = ? OR romaji = ?');
	const row = stmt.all(req.query.term, req.query.term, req.query.term);

	if (row === undefined) {
		const stmt2 = db.prepare('SELECT * FROM glossary WHERE ja = ? OR ja2 = ? OR furigana = ?');
		const row2 = stmt2.all(req.query.term, req.query.term, req.query.term);
		if (row2 === undefined) {
			res.json({
				rows: "NO MATCH"
			});
		} else {
			res.json({
				rows: row2
			});
		}

	} else {
		res.json({
			rows: row
		});
	}
});


function addTerm(en, ja, furigana, romaji, ja2, en2, context, type, note) {
	const stmt = db.prepare('INSERT INTO glossary (en,ja,furigana,romaji,ja2,en2,context,type,note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
	const info = stmt.run(en, ja, furigana, romaji, ja2, en2, context, type, note);
	// console.log(info.changes); // => 1
}


function translateString(original) {
	content = original;
	// console.log(content);
	var regex = new RegExp(/^([A-Za-z\-/ ]+): (.+)$/gm);
	var result, translation;
	translations = "";

	while ((result = regex.exec(content)) !== null) {
		let name = result[1].trim();
		let value = result[2].trim();
		// console.log(name, " : ", value);

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


function getLocalIp() {
	const os = require('os');

	for (let addresses of Object.values(os.networkInterfaces())) {
		for (let add of addresses) {
			if (add.address.startsWith('192.168.')) {
				return add.address;
			}
		}
	}
}