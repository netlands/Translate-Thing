var express = require('express');
var app = express();
var cors = require('cors')
var path = require('path');

BigInt.prototype.toJSON = function() { return this.toString(); };

const { default: Kuroshiro } = require("kuroshiro");
const KuromojiAnalyzer = require("kuroshiro-analyzer-kuromoji");

const kuroshiro = new Kuroshiro();

// Define the table name in a variable.
// Change 'glossary' to 'legacy' or any other table name to switch.
let tableName = 'glossary';
console.log(`Using table: ${tableName}`);

async function kanaToModernHepburn(kana) {
  var romaji = await kuroshiro.convert(kana, {
  to: "romaji",
  mode: "normal",
  romajiSystem: "hepburn"
  });

  // Replace "wa" not at start with "ha"
  romaji = romaji.replace(/(?<!^)wa/g, 'ha');

	// fix possible incorrect converted particles
	romaji = romaji.replace(/wa/g, (_, i) => kana[i] === 'は' ? 'ha' : 'wa')
    romaji = romaji.replace(/\be\b/g, (_, i) => kana[i] === 'へ' ? 'he' : 'e')
    romaji = romaji.replace(/\bo\b/g, (_, i) => kana[i] === 'を' ? 'wo' : 'o');

  // fix Katakana N to M
  const katakanaOnly = /^[\u30A0-\u30FFー\s]+$/.test(kana);
  if (!katakanaOnly) return romaji;

  // Replace 'm' before b/m/p with 'n' (only at word boundaries or after vowels)
  return romaji.replace(/([aeiou])m([bmp])/gi, "$1n$2");
}






const { postToBlogger, updatePostOnBlogger, getPostFromBlogger, oauth2Client, cleanPostObject, publishPostOnBlogger, revertPostToDraftOnBlogger } = require('./bloggerPoster');

// body parser for POST
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
const db = require('better-sqlite3')('tm.db', { safeIntegers: true });
// helper: provide a regexp function to SQLite so we can use whole-word regex matching for quoted terms
function escapeRegExp(s) {
	return (s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
db.function('regexp', (pattern, value) => {
	if (value === null || value === undefined) return 0;
	try {
		const re = new RegExp(pattern, 'i');
		return re.test(String(value)) ? 1 : 0;
	} catch (e) {
		return 0;
	}
});
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

app.use('/js/kuroshiro', express.static(path.join(__dirname, 'node_modules/kuroshiro/dist')));
app.use('/js/kuroshiro-analyzer-kuromoji', express.static(path.join(__dirname, 'node_modules/kuroshiro-analyzer-kuromoji/dist')));


app.use('/favicon.ico', express.static(__dirname + '/public/img/favicon.ico'));

// index page
app.get('/', function (req, res) {
	res.render('page/index', {
		result_from_database: res.body,
		tableName: tableName
	});
});

// Initialize dependencies and start the server
async function startServer() {
    try {
        console.log('⏳ Initializing Kuroshiro...');
        await kuroshiro.init(new KuromojiAnalyzer());
        console.log('✅ Kuroshiro initialized successfully.');

        app.listen(3000, function () {
            console.log('🚀 App active on http://127.0.0.1:3000 and http://' + getLocalIp() + ':3000');
            console.log('You can minimize this window while using the application.');
            open('http://127.0.0.1:3000');
        });
    } catch (e) {
        console.error('❌ Server startup failed:', e);
    }
}

startServer();


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
const { title } = require('process');

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

// Add the OAuth 2.0 callback route to handle Google's redirect
app.get('/oauth2callback', async (req, res) => {
	const { code } = req.query;
	if (!code) {
		return res.status(400).send('Authorization code is missing.');
	}
	try {
		// Exchange the code for tokens
		const { tokens } = await oauth2Client.getToken(code);
		oauth2Client.setCredentials(tokens);

		// Save the tokens to a file for future use
		fs.writeFileSync(path.join(__dirname, 'tokens.json'), JSON.stringify(tokens));
		console.log('✅ Tokens saved successfully.');
		res.send('<script>alert("Authentication successful! You can now close this tab and try posting again."); window.close();</script>');
	} catch (error) {
		console.error('❌ Error getting tokens:', error);
		res.status(500).send('Failed to retrieve access token.');
	}
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

app.get('/api/deleteterm', function (req, res) {
	// expects id in query
	const id = req.query.id;
	if (!id) {
		res.status(400).json({ message: 'missing id' });
		return;
	}
	try {
		const stmt = db.prepare(`DELETE FROM ${tableName} WHERE id = ?`);
		const info = stmt.run(id);
		if (info.changes && info.changes > 0) {
			res.json({ message: 'term deleted' });
		} else {
			res.status(404).json({ message: 'not found' });
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'error', error: err.message });
	}
});

app.post('/api/update-post-id', function (req, res) {
	const { id, postId } = req.body;

	if (!id || !postId) {
		return res.status(400).json({ success: false, message: 'Missing id or postId' });
	}

	try {
		const stmt = db.prepare(`UPDATE ${tableName} SET postId = ? WHERE id = ?`);
		const info = stmt.run(postId, id);

		if (info.changes > 0) {
			res.json({ success: true, message: 'postId updated successfully.' });
		} else {
			res.status(404).json({ success: false, message: 'Entry not found.' });
		}
	} catch (error) {
		console.error('Error updating postId:', error);
		res.status(500).json({ success: false, message: 'Server error while updating postId.' });
	}
});

// Change postStatus for an entry. Accepts { id, postStatus } or { postId, postStatus }
app.post('/api/change-post-status', async function (req, res) {
	const { id, postId, postStatus } = req.body;
	if (!postStatus) return res.status(400).json({ success: false, message: 'Missing postStatus' });
	const desired = (postStatus || '').toString().trim().toUpperCase();
	try {
		// First, locate the DB row
		let row;
		if (id) {
			row = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(id);
		} else if (postId) {
			row = db.prepare(`SELECT * FROM ${tableName} WHERE postId = ?`).get(postId);
		} else {
			return res.status(400).json({ success: false, message: 'Missing id or postId' });
		}
		if (!row) return res.status(404).json({ success: false, message: 'Entry not found' });

		// Helper to update DB after successful Blogger change
		function updateDbStatusForRow(dbId, newStatus, newPostId) {
			const updates = [];
			const params = [];
			if (newStatus !== undefined) {
				updates.push('postStatus = ?');
				params.push(newStatus);
			}
			if (newPostId !== undefined) {
				updates.push('postId = ?');
				params.push(newPostId);
			}
			if (updates.length === 0) return;
			params.push(dbId);
			const stmt = db.prepare(`UPDATE ${tableName} SET ${updates.join(', ')} WHERE id = ?`);
			stmt.run(...params);
		}

		// If requested ACTIVE -> publish or create+publish
		if (desired === 'ACTIVE') {
			if (row.postId) {
				// publish existing post
				try {
					await publishPostOnBlogger(row.postId);
					updateDbStatusForRow(row.id, 'ACTIVE');
					return res.json({ success: true, message: 'Post published and status updated', postStatus: 'ACTIVE' });
				} catch (err) {
					if (err && err.authUrl) return res.status(401).json({ success: false, message: 'Authentication required', authUrl: err.authUrl });
					console.error('Error publishing post:', err);
					return res.status(500).json({ success: false, message: 'Failed to publish post', error: err.message || String(err) });
				}
			} else {
				// create new live post (not draft)
				try {
					const generatedHtml = await createPostPage(row);
					const labels = (row.group || '').split(',').map(s => s.trim()).filter(Boolean);
					const result = await postToBlogger({ title: row.en, content: generatedHtml, labels: labels }, false);
					const newPostId = result && result.id ? result.id : null;
					updateDbStatusForRow(row.id, 'ACTIVE', newPostId);
					return res.json({ success: true, message: 'Post created and published', postStatus: 'ACTIVE', postId: newPostId });
				} catch (err) {
					if (err && err.authUrl) return res.status(401).json({ success: false, message: 'Authentication required', authUrl: err.authUrl });
					console.error('Error creating/publishing post:', err);
					return res.status(500).json({ success: false, message: 'Failed to create/publish post', error: err.message || String(err) });
				}
			}
		}

		// If requested DRAFT -> revert or create as draft
		if (desired === 'DRAFT') {
			if (row.postId) {
				try {
					await revertPostToDraftOnBlogger(row.postId);
					updateDbStatusForRow(row.id, 'DRAFT');
					return res.json({ success: true, message: 'Post reverted to draft and status updated', postStatus: 'DRAFT' });
				} catch (err) {
					if (err && err.authUrl) return res.status(401).json({ success: false, message: 'Authentication required', authUrl: err.authUrl });
					console.error('Error reverting post to draft:', err);
					return res.status(500).json({ success: false, message: 'Failed to revert post', error: err.message || String(err) });
				}
			} else {
				// create a draft post
				try {
					const generatedHtml = await createPostPage(row);
					const labels = (row.group || '').split(',').map(s => s.trim()).filter(Boolean);
					const result = await postToBlogger({ title: row.en, content: generatedHtml, labels: labels }, true);
					const newPostId = result && result.id ? result.id : null;
					updateDbStatusForRow(row.id, 'DRAFT', newPostId);
					return res.json({ success: true, message: 'Draft created and status updated', postStatus: 'DRAFT', postId: newPostId });
				} catch (err) {
					if (err && err.authUrl) return res.status(401).json({ success: false, message: 'Authentication required', authUrl: err.authUrl });
					console.error('Error creating draft post:', err);
					return res.status(500).json({ success: false, message: 'Failed to create draft', error: err.message || String(err) });
				}
			}
		}

		// For other statuses, just update DB locally
		updateDbStatusForRow(row.id, desired);
		return res.json({ success: true, message: 'postStatus updated locally', postStatus: desired });
	} catch (err) {
		console.error('Error changing postStatus:', err);
		res.status(500).json({ success: false, message: 'Server error', error: err.message });
	}
});

// Set postStatus locally in the DB without calling Blogger (used when we discover actual remote state)
app.post('/api/set-local-post-status', function (req, res) {
	const { id, postId, postStatus } = req.body;
	if (!postStatus) return res.status(400).json({ success: false, message: 'Missing postStatus' });
	try {
		let stmt;
		let info;
		if (id) {
			stmt = db.prepare(`UPDATE ${tableName} SET postStatus = ? WHERE id = ?`);
			info = stmt.run(postStatus, id);
		} else if (postId) {
			stmt = db.prepare(`UPDATE ${tableName} SET postStatus = ? WHERE postId = ?`);
			info = stmt.run(postStatus, postId);
		} else {
			return res.status(400).json({ success: false, message: 'Missing id or postId' });
		}

		if (info && info.changes && info.changes > 0) {
			res.json({ success: true, message: 'postStatus updated locally', postStatus: postStatus });
		} else {
			res.status(404).json({ success: false, message: 'Entry not found' });
		}
	} catch (err) {
		console.error('Error setting local postStatus:', err);
		res.status(500).json({ success: false, message: 'Server error', error: err.message });
	}
});

// Check if an English term exists in the glossary
app.get('/api/glossary/check', function (req, res) {
    const englishTerm = req.query.en;
    if (!englishTerm) {
        return res.status(400).json({ error: 'English term is required.' });
    }

    try {
        // Find one term matching the English value, case-insensitively
        const stmt = db.prepare(`SELECT * FROM ${tableName} WHERE en = ? COLLATE NOCASE`);
        const term = stmt.get(englishTerm);

        if (term) {
			console.log('Term exists:', term);
            res.json({ exists: true, term: term });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error while checking term.' });
    }
});

app.get('/api/getterm', function (req, res) {
	// http://127.0.0.1:3000/api/getterm?term=silk
	const stmt = db.prepare(`SELECT * FROM ${tableName} WHERE en = ? COLLATE NOCASE OR en2 = ? COLLATE NOCASE OR romaji = ? COLLATE NOCASE ORDER BY priority`);
	const row = stmt.get(req.query.term, req.query.term, req.query.term);

	if (row === undefined) {
		const stmt2 = db.prepare(`SELECT * FROM ${tableName} WHERE ja = ? OR ja2 = ? OR furigana = ?`);
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
	const stmt = db.prepare(`SELECT * FROM ${tableName} ORDER BY type, "group", priority `);
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

app.get('/api/getduplicates', function (req, res) {
	try {
		// Detect duplicates in either en or ja (case-insensitive, trimmed)
		const sql = `SELECT * FROM ${tableName}
			WHERE lower(trim(en)) IN (SELECT lower(trim(en)) FROM ${tableName} GROUP BY lower(trim(en)) HAVING COUNT(*)>1)
			   OR lower(trim(ja)) IN (SELECT lower(trim(ja)) FROM ${tableName} GROUP BY lower(trim(ja)) HAVING COUNT(*)>1)
			ORDER BY lower(trim(en)) COLLATE NOCASE, lower(trim(ja)) COLLATE NOCASE`;
		const stmt = db.prepare(sql);
		const rows = stmt.all();
		res.json({ rows: rows });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'error', error: err.message });
	}
});

// Execute a SELECT SQL query (READ-ONLY). For safety, only allow SELECT statements.
app.post('/api/execsql', function (req, res) {
	const sql = (req.body.sql || '').toString().trim();
	if (!sql) {
		res.status(400).json({ message: 'missing sql' });
		return;
	}
	try {
		// If the user supplied a full SELECT statement, run it (same as before)
		if (/^select\s+/i.test(sql)) {
			const stmt = db.prepare(sql);
			const rows = stmt.all();
			res.json({ rows: rows });
			return;
		}

		// Otherwise treat the input as a simplified query language.
		// Rules:
		// - The input may contain words separated by spaces and optionally joined by AND / OR (uppercase). If no operator is present between words, treat it as AND.
		// - Each term should be searched across a set of text columns using LIKE %term% (case-insensitive).
		// - Build a parameterized SELECT to avoid SQL injection.

		const input = sql; // not a SELECT; treat as simple query

		// Normalize spacing and treat commas as separators too
		let norm = input.replace(/,/g, ' ');
		// Split into tokens on whitespace
		let rawTokens = norm.split(/\s+/).filter(t => t.length > 0);
		// Clean tokens: trim surrounding punctuation except preserve quotes if explicitly used
		const tokens = rawTokens.map(t => {
			// If token starts and ends with matching quotes, keep them to mark literal
			if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
				return t; // keep quotes
			}
			return t.replace(/^[\s\,;:\.\(\)\[\]\"'`]+|[\s\,;:\.\(\)\[\]\"'`]+$/g, '');
		}).filter(t => t.length > 0);
		if (tokens.length === 0) {
			res.status(400).json({ message: 'empty query' });
			return;
		}

		// Build an array of clauses joined by AND/OR. We'll convert to a SQL WHERE clause.
		// Allowed operators are AND and OR (case-sensitive as requested). Any other token is a search term.

		const textColumns = ['en','en2','romaji','ja','ja2','furigana','context','type','note', '"group"'];

		let whereParts = [];
		let parameters = [];
		let displayParams = []; // human-readable values for display substitution

		// We'll parse tokens into groups separated by OR, and within each OR-group we'll AND the terms.
		// Example: ["silk","AND","cotton","OR","kimono"] => ((cols LIKE %silk% AND cols LIKE %cotton%) OR (cols LIKE %kimono%))

		let currentAndTerms = [];
		for (let i = 0; i < tokens.length; i++) {
			const tk = tokens[i];
			const tkUp = (tk || '').toUpperCase();
			if (tkUp === 'OR') {
				// flush currentAndTerms as one group
				if (currentAndTerms.length > 0) {
					whereParts.push({ type: 'ANDGROUP', terms: currentAndTerms.slice() });
					currentAndTerms = [];
				}
			} else if (tkUp === 'AND') {
				// explicit AND: just continue (AND is implicit)
				continue;
			} else {
				// a search term (may be quoted)
				// If quoted token, keep the quotes to mark it as literal
				currentAndTerms.push(tk);
			}
		}
		if (currentAndTerms.length > 0) {
			whereParts.push({ type: 'ANDGROUP', terms: currentAndTerms.slice() });
		}

		if (whereParts.length === 0) {
			res.status(400).json({ message: 'no searchable terms found' });
			return;
		}

		// For each ANDGROUP, build a clause like ( (col1 LIKE ? OR col2 LIKE ? ...) AND (col1 LIKE ? OR col2 LIKE ? ...) )
		let whereSqlPieces = [];
		for (let group of whereParts) {
			let termClauses = []; // each term => (col1 LIKE ? OR col2 LIKE ? ...)
			for (let term of group.terms) {
				let colOrs = [];
				// detect quoted literal
				let isQuoted = false;
				let literal = term;
				if ((term.startsWith('"') && term.endsWith('"')) || (term.startsWith("'") && term.endsWith("'"))) {
					isQuoted = true;
					literal = term.substring(1, term.length - 1);
				}

				for (let col of textColumns) {
					if (isQuoted) {
						// use sqlite regexp function for whole-word match: word boundary using \b may not work well with unicode,
						// but we'll use a conservative pattern that matches non-word boundaries around the literal.
						// We'll anchor to word boundaries using (?<!\w)literal(?!\w) where supported; fallback to \b if ok.
						const pat = `(?<!\\w)` + escapeRegExp(literal) + `(?!\\w)`;
						colOrs.push(`regexp(?, ${col})`);
						parameters.push(pat);
						// for display, show the original literal (not the regex pattern)
						displayParams.push(literal);
					} else {
						colOrs.push(`lower(${col}) LIKE ?`);
						const likeVal = '%' + term.toLowerCase() + '%';
						parameters.push(likeVal);
						displayParams.push(likeVal);
					}
				}
				termClauses.push('(' + colOrs.join(' OR ') + ')');
			}
			whereSqlPieces.push('(' + termClauses.join(' AND ') + ')');
		}

		const whereSql = whereSqlPieces.join(' OR ');
		const finalSql = `SELECT * FROM ${tableName} WHERE ${whereSql} ORDER BY type, "group", priority`;

		// Build a human-readable SQL for display by substituting parameter values into the query.
		// We do NOT execute this display SQL; execution below uses parameterized statement to remain safe.
		let displaySql = finalSql;
		function escapeForDisplay(v) {
			if (v === null || v === undefined) return "NULL";
			// show as single-quoted SQL literal, escape single quotes inside
			return "'" + String(v).replace(/'/g, "''") + "'";
		}
		for (let p of displayParams) {
			// replace the first occurrence of ? with the quoted/escaped parameter for display
			displaySql = displaySql.replace('?', escapeForDisplay(p));
		}

		const stmt2 = db.prepare(finalSql);
		const rows2 = stmt2.all(...parameters);
		res.json({ rows: rows2, transformedSql: displaySql });
		return;
	} catch (err) {
		console.error('SQL exec error:', err);
		res.status(500).json({ message: 'error', error: err.message });
	}
});

app.get('/api/switch-table', (req, res) => {
    tableName = (tableName === 'glossary') ? 'legacy' : 'glossary';
    console.log(`Switched table to: ${tableName}`);
    res.json({ tableName: tableName });
});

app.post('/api/move-to-glossary', (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Entry ID is missing.' });
    }

    // Use a transaction to ensure atomicity
    const moveTransaction = db.transaction(() => {
        // 1. Get the entry from the legacy table
        const legacyEntry = db.prepare('SELECT * FROM legacy WHERE id = ?').get(id);

        if (!legacyEntry) {
            throw new Error('Entry not found in legacy table.');
        }

        // 2. Insert the entry into the glossary table, letting the DB generate the new ID.
        const insertStmt = db.prepare(`
            INSERT INTO glossary (en, ja, furigana, romaji, ja2, en2, context, type, priority, "group", note)
            VALUES (@en, @ja, @furigana, @romaji, @ja2, @en2, @context, @type, @priority, @group, @note)
        `);
        
        const info = insertStmt.run({
            en: legacyEntry.en ?? '',
            ja: legacyEntry.ja ?? '',
            furigana: legacyEntry.furigana ?? '',
            romaji: legacyEntry.romaji ?? '',
            ja2: legacyEntry.ja2 ?? '',
            en2: legacyEntry.en2 ?? '',			
            context: legacyEntry.context ?? '',
            group: legacyEntry.group ?? '',
            type: legacyEntry.type ?? '',
            priority: legacyEntry.priority ?? '',						
            note: legacyEntry.note ?? ''
        });

        const newGlossaryId = info.lastInsertRowid;

        // If there was a postId, update the new glossary entry with it.
        if (legacyEntry.postId && newGlossaryId) {
            const updatePostIdStmt = db.prepare('UPDATE glossary SET postId = ? WHERE id = ?');
            updatePostIdStmt.run(legacyEntry.postId, newGlossaryId);
        }

        // 3. Delete the entry from the legacy table
        const deleteStmt = db.prepare('DELETE FROM legacy WHERE id = ?');
        const deleteInfo = deleteStmt.run(id);
        if (deleteInfo.changes === 0) {
            throw new Error('Failed to delete entry from legacy table after inserting into glossary.');
        }
    });

    try {
        moveTransaction();
        res.json({ message: 'Entry moved to glossary successfully.' });
    } catch (error) {
        console.error('Error moving entry:', error);
        // Check for specific error message to return 404
        if (error.message.includes('Entry not found')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'An error occurred while moving the entry.' });
    }
});


app.get('/api/getrows', function (req, res) {
	const stmt = db.prepare(`SELECT * FROM ${tableName} WHERE en = ? OR en2 = ? COLLATE NOCASE OR romaji = ? COLLATE NOCASE  ORDER BY type, "group", priority `);
	const row = stmt.all(req.query.term, req.query.term, req.query.term);

	if (row === undefined) {
		const stmt2 = db.prepare(`SELECT * FROM ${tableName} WHERE ja = ? OR ja2 = ? OR furigana = ?`);
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
	const stmt = db.prepare(`INSERT INTO ${tableName} (en,ja,furigana,romaji,ja2,en2,context,type,priority,"group",note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
	const info = stmt.run(en, ja, furigana, romaji, ja2, en2, context, type, priority, group, note);
	// console.log(info.changes); // => 1
}

function updateTerm(en, ja, furigana, romaji, ja2, en2, context, type, priority, group, note, id) {
	const stmt = db.prepare(`UPDATE ${tableName} SET en = ?, ja = ?, furigana = ?, romaji = ?, ja2 = ?, en2 = ?, context = ?, type = ?, priority = ?, "group" = ?, note = ? WHERE id = ? `); 
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
		const stmt = db.prepare(`SELECT en, ja FROM ${tableName} WHERE type = ? COLLATE NOCASE`);
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
		const row = db.prepare(`SELECT * FROM ${tableName} WHERE (en = ? COLLATE NOCASE OR en2 = ? COLLATE NOCASE) ORDER BY priority`).get(name, name);
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
	const row2 = db.prepare(`
	SELECT * FROM ${tableName}
	WHERE en = ? COLLATE NOCASE
		OR romaji = ? COLLATE NOCASE
		OR ', ' || LOWER(en2) || ', ' LIKE '%, ' || LOWER(?) || ', %'
	ORDER BY priority
	`).get(term, term, term);
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

async function createPostPage(entry) {
	const templatePath = 'glossary-template.html';
	let templateContent = "";
	try {
		templateContent = fs.readFileSync(templatePath, 'utf-8');
	} catch (error) {
		console.error('Error reading glossary template file:', error);
		return res.status(500).json({ message: 'Error reading template file' });
	}

	const isValid = value => value != null && value.trim() !== '';

	if (isValid(entry.ja2)) {
				templateContent = templateContent.replace(/%ja%/g, '%ja% (%ja2%)' || '')
	}

	// Replace placeholders
	let generatedHtml = templateContent
		.replace(/%id%/g, entry.id || '0')
		.replace(/%en%/g, '<span class="en">' + entry.en + '</span>' || '')
		.replace(/%ja%/g, '<span class="ja">' + entry.ja + '</span>' || '')
		.replace(/%romaji%/g, '<span class="romaji">' + entry.romaji + '</span>' || '')		
		.replace(/%group%/g, (entry.group || '').split(',').map(s => s.trim()).filter(Boolean).map(s => `<span hidden class="label">${s}</span>`).join(' '))
		.replace(/%context%/g, (entry.context || '').split(',').map(s => s.trim()).filter(Boolean).map(s => `<span class="tag">#${s}</span>`).join(' '))
		.replace(/%ja2%/g, (entry.ja2 || '').split(',').map(s => s.trim()).filter(Boolean).map(s => `<span class="ja-alternative-writing">${s}</span>`).join(' '))

		if (entry.ja != entry.furigana) {
			generatedHtml = generatedHtml.replace(/%furigana%/g, '<span class="furigana">' + entry.furigana + '</span>' || '')
		} else {generatedHtml = generatedHtml.replace(/%furigana%/g,''); }

	// Handle special placeholders
	const hepburn = await kanaToModernHepburn(entry.furigana || '');
	if (hepburn !== entry.romaji) {
		generatedHtml = generatedHtml.replace(/%hepburn%/g, '<span class="hepburn">' + hepburn + '</span>');
	} else { generatedHtml = generatedHtml.replace(/%hepburn%/g,''); }

	// clean up multiple dots
	generatedHtml = generatedHtml
		.replace(/・<(?!\/)[^>\s]+(?:\s[^>]*)?><\/\1>・|・<[^>]+\/>・/g, '・') // Change "・" with an empty element between
		.replace(/・{2,}/g, "・")      // Change 2 or more consecutive "・"
		.replace(/・(?=<\/)/g, '');	   // Remove "・" before a closing tag

	// Process note into summary and content  
	const note = entry.note || '';
	/*
	const paragraphs = (note || '').trim().split(/\r?\n+/).map(p => p.trim()).filter(Boolean);

	const summary = `<p class="summary">%en2%${paragraphs[0] || '%en2%'}</p>`;
	const content = paragraphs.length > 1
	? paragraphs.slice(1).map(p => `<p>${p}</p>`).join('\n'): '';

	generatedHtml = generatedHtml.replace(/%summary%/g, summary).replace(/%content%/g, content);
	*/
	let summary = '';
	let content = markdownToHtml(note || '');
	generatedHtml = generatedHtml.replace(/%summary%/g, summary).replace(/%content%/g, content);
	if (isValid(entry.en2)) {
		generatedHtml = generatedHtml.replace('<p class="summary">', '<p class="summary"><span class="literal-meaning">' + entry.en2 + '</span>. ' || '<p class="summary">')
	}
	// clean up any unreplaced placeholders
	generatedHtml = generatedHtml.replace(/%[a-z0-9-]+%/g, '');

	return generatedHtml;
}

app.post('/api/create-glossary-page', async function (req, res) {
	const entry = req.body;
	if (!entry) {
		return res.status(400).json({ message: 'Glossary entry data is missing.' });
	}

	generatedHtml = await createPostPage(entry);

	res.json({ html: generatedHtml });
});

app.get('/api/glossary-css', function (req, res) {
	const cssPath = path.join(__dirname, 'glossary.css');
	fs.readFile(cssPath, 'utf8', (err, data) => {
		if (err) {
			console.error('Error reading glossary.css:', err);
			return res.status(500).send('Could not load styles.');
		}
		res.setHeader('Content-Type', 'text/css');
		res.send(data);
	});
});

app.post('/api/post-to-blogger', async function (req, res) {
	const entry = req.body;
	console.log('Received request to post to Blogger:', entry);
	if (!entry) {
		return res.status(400).json({ message: 'Glossary entry data is missing.' });
	}

	postTitle = entry.en;
	postTitle = postTitle.replace(/\b\w+\b/g, w => /^[A-Z]/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

	generatedHtml = await createPostPage(entry);
	labels = entry.group.split(',').map(s => s.trim());

	// Use the hardcoded sample postData as requested for now.
	const postData = {
		title: postTitle,
		content: generatedHtml,
		labels: labels
	};

	try {
		// Call the existing postToBlogger function
		const result = await postToBlogger(postData);
		res.json({ message: 'Successfully posted to glossary!', result: result });
	} catch (error) {
		// If the error is an authentication error, send the auth URL to the client
		if (error.authUrl) {
			console.log('Authentication required. Sending auth URL to client.');
			return res.status(401).json({ message: 'Authentication required.', authUrl: error.authUrl });
		}
		// For other errors, send a generic server error
		console.error('Error posting to Blogger:', error.message);
		res.status(500).json({ message: 'Failed to post to glossary.', error: error.message });
	}
});

app.post('/api/update-post-on-blogger', async function (req, res) {
	const entry = req.body;
	console.log('Received request to update post on Blogger:', entry);
	if (!entry || !entry.postId) {
		return res.status(400).json({ message: 'Glossary entry data with postId is missing.' });
	}

	postTitle = entry.en;
	postTitle = postTitle.replace(/\b\w+\b/g, w => /^[A-Z]/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

	generatedHtml = await createPostPage(entry);
	labels = entry.group.split(',').map(s => s.trim());

	const postData = {
        postId: entry.postId,
		title: postTitle,
		content: generatedHtml,
		labels: labels
	};

	try {
		const result = await updatePostOnBlogger(postData);
		res.json({ message: 'Successfully updated post on glossary!', result: result });
	} catch (error) {
		if (error.authUrl) {
			console.log('Authentication required. Sending auth URL to client.');
			return res.status(401).json({ message: 'Authentication required.', authUrl: error.authUrl });
		}
		console.error('Error updating post on Blogger:', error.message);
		res.status(500).json({ message: 'Failed to update post on glossary.', error: error.message });
	}
});

app.get('/api/get-blogger-post/:id', async function (req, res) {
	const postId = req.params.id;
	if (!postId) {
		return res.status(400).json({ message: 'Post ID is missing.' });
	}
	
	try {
		const result = await getPostFromBlogger(postId);
		res.json(cleanPostObject(result));
	} catch (error) {
		if (error.authUrl) {
			console.log('Authentication required. Sending auth URL to client.');
			return res.status(401).json({ message: 'Authentication required.', authUrl: error.authUrl });
		}
		console.error('Error fetching post from Blogger:', error.message);
		res.status(500).json({ message: 'Failed to fetch post from Blogger.', error: error.message });
	}
});

app.post('/api/import-legacy', (req, res) => {
    const { entries } = req.body;

    if (!entries || !Array.isArray(entries)) {
        return res.status(400).json({ message: 'Invalid entries data.' });
    }

    try {
        // Create the legacy table if it doesn't exist
        db.exec(`
            CREATE TABLE IF NOT EXISTS legacy (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                postStatus TEXT,
				postId TEXT,
                en TEXT,
                ja TEXT,
                ja2 TEXT,
                furigana TEXT,
                romaji TEXT,
                note TEXT,
                context TEXT,
                "group" TEXT
            )
        `);

        const insert = db.prepare('INSERT INTO legacy (postId, postStatus, en, ja, ja2, furigana, romaji, note, context, "group", en2, type, priority) VALUES (@postId, @postStatus, @en, @ja, @ja2, @furigana, @romaji, @note, @context, @group, @en2, @type, @priority)');

		const insertMany = db.transaction((entries) => {
		for (const entry of entries) {
			insert.run({
				postId: entry.postId ?? "",       // fallback to empty string
				postStatus: entry.postStatus ?? "",
				en: entry.en ?? "",
				ja: entry.ja ?? "",
				ja2: entry.ja2 ?? "",
				furigana: entry.furigana ?? "",
				romaji: entry.romaji ?? "",
				note: entry.note ?? "",
				context: entry.context ?? "",
				group: entry.group ?? "",
				en2: "",
				type: "",
				priority: ""
			});
		}
		});



        insertMany(entries);

        res.json({ message: `${entries.length} legacy entries imported successfully.` });
    } catch (error) {
        console.error('Error importing legacy entries:', error);
        res.status(500).json({ message: 'Error importing legacy entries.' });
    }
});

function markdownInlineToHtml(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')   // Bold
    .replace(/\*(.+?)\*/g, '<em>$1</em>')               // Italic
    .replace(/`(.+?)`/g, '<code>$1</code>')             // Inline code
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>'); // Links
}

function markdownToHtml(markdown) {
  const lines = markdown.split('\n');
  let html = '';
  let inUnorderedList = false;
  let inOrderedList = false;
  let firstParagraphDone = false;

  const closeLists = () => {
    if (inUnorderedList) {
      html += '</ul>\n';
      inUnorderedList = false;
    }
    if (inOrderedList) {
      html += '</ol>\n';
      inOrderedList = false;
    }
  };

  lines.forEach(line => {
    // Headings
    if (/^#{1,6}\s/.test(line)) {
      closeLists();
      const level = line.match(/^#{1,6}/)[0].length;
      const content = line.replace(/^#{1,6}\s*/, '');
      html += `<h${level}>${markdownInlineToHtml(content)}</h${level}>\n`;
      return;
    }

    // Ordered list: "1. item"
    if (/^\s*\d+\.\s+/.test(line)) {
      if (!inOrderedList) {
        closeLists();
        html += '<ol>\n';
        inOrderedList = true;
      }
      const content = line.replace(/^\s*\d+\.\s+/, '');
      html += `<li>${markdownInlineToHtml(content)}</li>\n`;
      return;
    }

    // Unordered list: "- item" or "* item"
    if (/^\s*[-*]\s+/.test(line)) {
      if (!inUnorderedList) {
        closeLists();
        html += '<ul>\n';
        inUnorderedList = true;
      }
      const content = line.replace(/^\s*[-*]\s+/, '');
      html += `<li>${markdownInlineToHtml(content)}</li>\n`;
      return;
    }

    // Paragraphs
    if (line.trim() !== '') {
      closeLists();
      const content = markdownInlineToHtml(line.trim());
      if (!firstParagraphDone) {
        html += `<p class="summary">${content}</p>\n<!--more-->\n`;
        firstParagraphDone = true;
      } else {
        html += `<p>${content}</p>\n`;
      }
      return;
    }

    // Blank line → close lists if any
    closeLists();
  });

  closeLists();
  return html;
}

// const postData = {
//   title: 'This is the post title',
//   content: '<p>This is the post content</p>',
//   labels: ['label1', 'label2', 'label3'],
// };

// // Usage:
// postToBlogger(postData);
