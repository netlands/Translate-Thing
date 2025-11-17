const fs = require('fs');
const xml2js = require('xml2js');
const he = require('he');
const cheerio = require('cheerio');

function splitJa(rawJa) {
  // Trim outer whitespace and decorative ・ at the edges
  const trimmed = rawJa.trim().replace(/^・+|・+$/g, '').replace(/^\s+|\s+$/g, '');

  // Split into parts by whitespace
  const parts = trimmed.split(/\s+/);

  let romaji = null;
  let furigana = null;
  const jaParts = [];

  for (const part of parts) {
    if (/^[a-zA-Z]+$/.test(part)) {
      romaji = part;
    } else if (/^[\u3040-\u309F]+$/.test(part)) {
      furigana = part;
    } else {
      jaParts.push(part);
    }
  }

  // Reconstruct Japanese string
  const jaRaw = jaParts.join(' ').trim();

  // If there's exactly one ・ inside jaRaw, split it
  const jaSplit = jaRaw.split('・');
  const ja = jaSplit.length === 2 ? jaSplit[0].trim() : jaRaw;
  const ja2 = jaSplit.length === 2 ? jaSplit[1].trim() : null;

  return {
    ja,
    ja2,
    furigana: furigana || null,
    romaji: romaji || null
  };
}

function parseEntry(entry) {
  const postidMatch = entry.id?.match(/post-(\d+)/);
  const postid = postidMatch ? postidMatch[1] : null;

  const labels = [];
  if (entry.category) {
    const categories = Array.isArray(entry.category) ? entry.category : [entry.category];
    for (const cat of categories) {
      if (cat.$?.term) labels.push(cat.$.term);
    }
  }

  const rawContent = entry.content?._ || entry.content || '';
  const decodedContent = he.decode(rawContent);
  const $ = cheerio.load(decodedContent);

  const rawJa = $('div.japanese.notranslate').first().text().trim() || '';
  const { ja, furigana, romaji } = splitJa(rawJa);

  const tagText = $('div.tags').first().text() || '';
  const tags = tagText
    .split(/\s+/)
    .filter(word => word.startsWith('#'))
    .map(tag => tag.slice(1));

let definition = null;
const hrElements = $('hr');
if (hrElements.length >= 2) {
  const start = $(hrElements[0]);
  const end = $(hrElements[1]);
  const definitionNodes = [];

  let current = start[0].next;
  while (current && current !== end[0]) {
    definitionNodes.push($.html(current));
    current = current.next;
  }

  const rawDefinition = definitionNodes.join('').trim();

  // Replace </p> with line breaks, then strip all tags
  const withLineBreaks = rawDefinition.replace(/<\/p>/gi, '</p>\n');
  const stripped = cheerio.load(withLineBreaks).text().trim();

  definition = stripped;
}



  return {
    postid,
    title: { en: entry.title || null },
    content: decodedContent,
    ja,
    furigana,
    romaji,
    definition,
    tags,
    labels
  };
}

async function parseAtomFile(filePath) {
  const xml = await fs.promises.readFile(filePath, 'utf8');
  const result = await xml2js.parseStringPromise(xml, { explicitArray: false });

  const entries = result.feed.entry;
  const parsed = Array.isArray(entries) ? entries.map(parseEntry) : [parseEntry(entries)];
  return parsed;
}

module.exports = { parseAtomFile };

/* Example usage:
const { parseAtomFile } = require('./atomParser');

(async () => {
  const data = await parseAtomFile('your-atom-file.xml');
  console.log(JSON.stringify(data, null, 2));
})();
*/