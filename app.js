var express = require('express');
var app = express();
var cors = require('cors')
var path = require('path');
const db = require('better-sqlite3')('tm.db');
const open = require('open');
const {
	Agent
} = require('http');
const {
	takeCoverage
} = require('v8');

app.use(cors())

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
app.use('/js', express.static(__dirname + '/node_modules/bootstrap-select/dist/js')); // redirect bootstrap-select
app.use('/css', express.static(__dirname + '/node_modules/bootstrap-select/dist/css')); // redirect bootstrap-select
app.use('/js', express.static(__dirname + '/node_modules/wanakana/umd')); // redirect wanakana



app.use('/favicon.ico', express.static(__dirname + '/public/img/favicon.ico'));

// index page
app.get('/', function (req, res) {
	res.render('page/index', {
		result_from_database: res.body
	});
});

// start server
app.listen(3000, function () {
	console.log('App active on http://127.0.0.1:3000 and http://' + getLocalIp() + ':3000');
	console.log('You can minimize this window while using the application.');
	open('http://127.0.0.1:3000');
});


app.get('/api/translate', function (req, res) {
	//console.log(req.query);
	res.json({
		translation: translateString(req.query.original),
		ja: {
			category: categoryJa,
			age: ageJa,
			type: typeJa.split("、"),
			color: colorJa.split("、"),
			material: materialJa.split("、"),
			pattern: patternJa.split("、"),
			technique: techniqueJa.split("、"),
			kamon: kamonJa.split("、"),
			rakkan: rakkanJa.split("、")						
		},
		en: {
			category: categoryEn,
			age: ageEn,
			type: typeEn.split(",").map(Function.prototype.call, String.prototype.trim),
			color: colorEn.split(",").map(Function.prototype.call, String.prototype.trim),
			material: materialEn.split(",").map(Function.prototype.call, String.prototype.trim),
			pattern: patternEn.split(",").map(Function.prototype.call, String.prototype.trim),
			technique: techniqueEn.split(",").map(Function.prototype.call, String.prototype.trim),
			kamon: kamonEn.split(",").map(Function.prototype.call, String.prototype.trim),
			rakkan: rakkanEn.split(",").map(Function.prototype.call, String.prototype.trim)						
		},
		size: {
			mitake: mitake,
			yuki: yuki,			
			sodetake: sodetake,
			sodehaba: sodehaba,
			katahaba: katahaba,
			maehaba: maehaba,
			ushirohaba: ushirohaba						
		}
	});
});

const fs = require('fs');

app.get('/api/template', function (req, res) {
	//console.log(req.query);
	const filePath = 'template.txt';
	var fileContent = "";
	try {
	// Read the file synchronously
	fileContent = fs.readFileSync(filePath, 'utf-8');
	} catch (error) {
	console.error('Error reading file:', error);
	}

	res.json({
		template: fileContent
	});
});


app.get('/api/addterm', function (req, res) {
	// console.log(req.query);
	addTerm(req.query.en, req.query.ja, req.query.furigana, req.query.romaji, req.query.ja2, req.query.en2, req.query.context, req.query.type, req.query.priority, req.query.group, req.query.note);
	res.json({
		message: "term added"
	});
});

app.get('/api/updateterm', function (req, res) {
	// console.log(req.query);
	updateTerm(req.query.en, req.query.ja, req.query.furigana, req.query.romaji, req.query.ja2, req.query.en2, req.query.context, req.query.type, req.query.priority, req.query.group, req.query.note, req.query.id);
	res.json({
		message: "term updated"
	});
});

app.get('/api/getterm', function (req, res) {
	// http://127.0.0.1:3000/api/getterm?term=silk
	const stmt = db.prepare('SELECT * FROM glossary WHERE en = ? COLLATE NOCASE OR en2 = ? COLLATE NOCASE OR romaji = ? COLLATE NOCASE ORDER BY priority');
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

app.get('/api/gettable', function (req, res) {
	const stmt = db.prepare('SELECT * FROM glossary ORDER BY type, "group", priority ');
	const row = stmt.all();

	if (row === undefined) {
		res.json({
			rows: "NO DATA"
		});
	} else {
		res.json({
			rows: row
		});
	}
});


app.get('/api/getrows', function (req, res) {
	const stmt = db.prepare('SELECT * FROM glossary WHERE en = ? OR en2 = ? COLLATE NOCASE OR romaji = ? COLLATE NOCASE  ORDER BY type, "group", priority ');
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


function addTerm(en, ja, furigana, romaji, ja2, en2, context, type, priority, group, note) {
	const stmt = db.prepare('INSERT INTO glossary (en,ja,furigana,romaji,ja2,en2,context,type,priority,"group",note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
	const info = stmt.run(en, ja, furigana, romaji, ja2, en2, context, type, priority, group, note);
	// console.log(info.changes); // => 1
}

function updateTerm(en, ja, furigana, romaji, ja2, en2, context, type, priority, group, note, id) {
	const stmt = db.prepare('UPDATE glossary SET en = ?, ja = ?, furigana = ?, romaji = ?, ja2 = ?, en2 = ?, context = ?, type = ?, priority = ?, "group" = ?, note = ? WHERE id = ? '); 
	const updates = stmt.run(en, ja, furigana, romaji, ja2, en2, context, type, priority, group, note, id);
	// console.log(updates.changes); // => 1
}

function translateString(original) {
	translation = translateProperties(original);
	return translation;
}


function translateProperties(original) {
	content = original;
	// console.log(content);

	// get category from the first line
	categoryEn = "";
	categoryJa = "";
	try {
		firstLine = /^([^\.]+?)\./g.exec(content)[0].trim();
		const stmt = db.prepare('SELECT en, ja FROM glossary WHERE type = ? COLLATE NOCASE');
		const rows = stmt.all("category");
		for (let i = 0; i < rows.length; i++) {
			// console.log(rows[i].en);
			const regex = new RegExp("\\b" + rows[i].en + "\\b", "gi");
			if (regex.test(firstLine)) {
				categoryEn = rows[i].en;
				categoryJa = rows[i].ja;
				break;
			}
		}
	} catch (error) {

	}


	ageEn = "";
	ageJa = "";
	typeEn = "";
	typeJa = "";
	colorEn = "";
	colorJa = "";
	materialEn = "";
	materialJa = "";
	patternEn = "";
	patternJa = "";
	techniqueEn = "";
	techniqueJa = "";
	kamonEn = "";
	kamonJa = "";	
	rakkanEn = "";
	rakkanJa = "";			
	mitake = "";
	yuki = "";
	sodetake = "";
	sodehaba = "";
	katahaba = "";
	maehaba = "";
	ushirohaba = "";

	// get all property name : value pairs
	var regex = new RegExp(/^([A-Za-z\-/ ]+): (.+)$/gm);
	var result, translation;
	translations = "";

	while ((result = regex.exec(content)) !== null) {
		let name = result[1].trim();
		let value = result[2].trim();
		// console.log(name, " : ", value);

		if (value.toLowerCase().includes("yuki:")) {
			name = "yuki";
			value = /(.+?):([^\)]+)/g.exec(value)[2].trim();
		}

		if (value.toLowerCase().includes("kata-haba:")) {
			name = "kata-haba";
			value = /(.+?):([^\)]+)/g.exec(value)[2].trim();
		}

		// translate property name 
		translation = "";
		propertyName = name;
		propertyEn = name;
		const row = db.prepare("SELECT * FROM glossary WHERE (en = ? COLLATE NOCASE OR en2 = ? COLLATE NOCASE) ORDER BY priority").get(name, name);
		if (row !== undefined) {
			if (row.type == "property") {
				translation = row.ja;
			} else {
				translation = row.ja;
			}
		} else {
			translation = name;
		}

		propertyName = translation;
		translation = translation + "：";

		// prepare the value for translation
		// Remove extra spaces
		value = value.replace(/\s{2,}/g, ' ');
		// Segmentation rules [.,?!;:§¶]
		value = value.replace(/\s*([.,?!;:§])\s*/g, '$1');	
		// Replace commas inside round brackets with "§"		
    	value = value.replace(/\(([^）]+),([^）]+)\)/g, '($1§$2)');

		// translate all property values 
		const values = value.split(",");

		newValues = "、";
		for (let i = 0; i < values.length; i++) {
			value = values[i].trim();
			if (value.length > 0) {
				valueJa = getTranslation(value);
				valueJa = valueJa.replace(/([\d]+?)(?: )*(kg|cm|g|m)/g, "$1 $2");
				valueJa = valueJa.replace(/([\d]+?(?: )?(?:kg|cm|g|m)?)\s*?[xX×\*]\s*?([\d]+)/g, "$1 × $2"); // ×

				/*/ check if we have location information in brackets
				// and get position (upper, left, front) and part (panel, sleeve, ...)
				const regex = /[\(（]\b(?:top|bottom|upper|lower|left|right|front|back|inside|outside)\b.+?[\)）]/gi;
				if (regex.test(valueJa)) {
					// (?=\b(?:top|bottom|upper|lower|left|right|front|back|inside|outside)\b)\b(?:top|bottom|upper|lower|left|right|front|back|inside|outside)?
					const result = valueJa.match(regex);
					if (result) {
						// console.log("Match found:", result[0]);
						translatedSentence = translateSentence(result[0].replace(/^[\(（]+|[\)）]+$/g, ''), " ");
						translatedSentence = translatedSentence.replace("|","、");
						valueJa = valueJa.replace(result[0],"（"+translatedSentence+"）");
					}
				}*/	

				// check if we have any text between collons that contains more than one word (contains a space or collon) 
				const regex2 = /[\(（]([^)]+)[\)）]/g;
				let match;
			  
				while ((match = regex2.exec(valueJa)) !== null) {
				  const content = match[1];
				  // console.log(content);
				  if (/[ ,:]/.test(content)) {
					translatedSentence = translateSentence(content);
					valueJa = valueJa.replace(content,translatedSentence);
				  }
				}					
				valueJa = valueJa.replace("§","、");


				if (newValues.includes('、' + valueJa + '、')) {} else {
					newValues = newValues + valueJa + "、";
				}
			}
		}

		const reg = /^([、\s]*)(.+?)([、\s]*)$/g;
		newValues = newValues.replace(reg, "$2");

		newValues = newValues.replace("（" + propertyName + "）", "");


		switch (propertyEn) {
			case "age":
				ageEn = values.join(",");
				ageJa = newValues
				break;
			case "type":
				typeEn = values.join(",");
				typeJa = newValues
				break;
			case "color":
				colorEn = values.join(",");
				colorJa = newValues
				break;
			case "material":
				materialEn = values.join(",");
				materialJa = newValues
				break;
			case "pattern":
				patternEn = values.join(",");
				patternJa = newValues
				break;
			case "technique":
				techniqueEn = values.join(",");
				techniqueJa = newValues
				break;	
			case "kamon":
				kamonEn = values.join(",");
				kamonJa = newValues
				break;
			case "rakkan":
				rakkanEn = values.join(",");
				rakkanJa = newValues
				break;																		
		}

		switch (propertyName) {
			case "身丈":
				mitake = newValues;	
				note = "";		
				if ((/(.+?)([\(（].+?[\)）])/).test(newValues)) {
					parts = newValues.match(/(.+?)([\(（].+?[\)）])/);
					newValues = getTranslation(parts[1].trim());
					note = getTranslation(parts[2].trim());
					if (note.includes("shoulder") || note.includes("肩から")) {
						note = "（肩から）";
					} else if (note.includes("back") || note.includes("背から")) {
						note = "（背から）";
					} else {
						note = "";
					}
				}
				translation = translation.replace("：",note+"：")
				newValues = newValues + kujirajaku(newValues);
				break;
			case "裄丈":
				yuki = newValues;
				newValues = newValues + kujirajaku(newValues);				
				break;
			case "袖幅":
				sodehaba = newValues;
				newValues = newValues + kujirajaku(newValues);				
				break;
			case "肩幅":
				katahaba = newValues;
				newValues = newValues + kujirajaku(newValues);				
				break;
			case "袖丈":
				sodetake = newValues;
				// standard size check: 49 cm = 1 尺 3 寸 = 49.2 cm
				if (newValues.startsWith('49 ')) {
					newValues = newValues + '（1 尺 3 寸）';
				} else {
					newValues = newValues + kujirajaku(newValues);
				}				
				break;
			case "前幅":
				maehaba = newValues;
				newValues = newValues + kujirajaku(newValues);				
				break;
			case "後幅":
				ushirohaba = newValues;
				newValues = newValues + kujirajaku(newValues);				
				break;													
		}

		translation = translation + newValues;


		translations = translations + translation + "\n";
	}

	return categoryJa + "\n----------\n" + translations
}

function kujirajaku(inputValue) {
	bu = "";
	sun = "";
	shaku = "";
	let re = inputValue.match(/([0-9\.]+\s*)(mm|cm|m)/);
	inputUnit = re[2];
	inputValue = Number(inputValue.match(/([0-9\.]+)/g));
	if (inputUnit == "m" ) { 
		inputValue = inputValue * 100 
	};
	c = 37.87878788; // 1 shake = 37.87878788 cm
	calculatedValue = Math.round(inputValue/c*100).toString(); // for rin (厘) devide by 1000
	if (calculatedValue.substr(calculatedValue.length - 1) != "0") { bu = calculatedValue.substr(calculatedValue.length - 1) + " 分" };
	if (calculatedValue.length > 1 && calculatedValue.substr(calculatedValue.length - 2,1) != "0") { sun = calculatedValue.substr(calculatedValue.length - 2,1) + " 寸" };
	if (calculatedValue.length > 2) { shaku = calculatedValue.substring(0,calculatedValue.length - 2) + " 尺" };
	// console.log(inputValue + "cm : " + calculatedValue + " : " + (shaku + " " + sun + " " + bu).trim());
	return "（" + (shaku + " " + sun + " " + bu).trim() + "）"
}

function translateSentence(input) {
	// Split the string based on the specified separators
	const separators = [',', '.', '!', '?', ':', ';', ' ',"§","¶"];
	const regex = new RegExp(`(${separators.map(sep => '\\' + sep).join('|')})`);
	const parts = input.split(regex);
  
	// Process each part
	const processedParts = parts.map(part => {
	  if (separators.includes(part)) {
		return part; // Return the separator as is
	  } else {
		return getTranslation(part); // Process the word
	  }
	});
  
	// Join the parts back together
	var translatedSentence = processedParts.join('');
	translatedSentence = replaceSymbols(translatedSentence);
	return translatedSentence;
}

/*
function translateSentence(sentence, separator) {
    // Split the sentence based on spaces
    const words = sentence.split(' ');
    // Run getTranslation on each part
    const translatedWords = words.map(getTranslation);
    // Put the string together again
    separator = ""; // remove spaces from translation
	const translatedSentence = translatedWords.join(separator);
    return translatedSentence;
}
*/

function replaceSymbols(input) {
	const symbolMap = {
	  '.': '。',
	  ',': '、',
	  ';': '；',
	  ':': '：',
	  '!': '！',
	  '?': '？',
	  ' ': ''	  
	};
  
	let result = '';
	for (let char of input) {
	  if (symbolMap[char]) {
		result += symbolMap[char];
	  } else {
		result += char;
	  }
	}
	return result;
  }


function getTranslation(term) {
	if ((/(.+?)(\(.+?\))/).test(term)) {
		terms = term.match(/(.+?)\((.+?)\)/);
		part1 = getTranslation(terms[1].trim());
		part2 = getTranslation(terms[2].trim());
		if (part1 != part2) {
			return part1 + "（" + part2 + "）"
		} else {
			return part1
		}
	} else {
		const row2 = db.prepare('SELECT * FROM glossary WHERE en = ? COLLATE NOCASE OR en2 = ? COLLATE NOCASE OR romaji = ? COLLATE NOCASE ORDER BY priority').get(term, term, term);
		if (row2 !== undefined) {
			return row2.ja;
		} else {
			return term;
		}
	}
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