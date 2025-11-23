function atomParser(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const entries = Array.from(xmlDoc.querySelectorAll("entry"));

    function splitJa(rawJa) {
        // Trim outer whitespace and decorative ・ at the edges
        const trimmed = rawJa.trim().replace(/^・+|・+$/g, '').replace(/^\s+|\s+$/g, '');

        // Split by decorative separator
        const parts = trimmed.split('・').map(p => p.trim()).filter(Boolean);

        let romaji = null;
        let furigana = null;
        let ja = null;
        let ja2 = null;

        for (const part of parts) {
            if (/^[a-zA-Z]+$/.test(part)) {
                romaji = part;
            } else if (/^[\u3040-\u309F]+$/.test(part)) {
                furigana = part;
            } else {
                if (!ja) ja = part;
                else if (!ja2) ja2 = part;
            }
        }

        return {
            ja,
            ja2,
            furigana,
            romaji
        };
    }

    function parseEntry(entry) {
        const idElement = entry.querySelector("id");
        const postidMatch = idElement ? idElement.textContent.match(/post-(\d+)/) : null;
        const postid = postidMatch ? postidMatch[1] : null;

        const labels = Array.from(entry.querySelectorAll("category")).map(c => c.getAttribute("term"));

        const contentElement = entry.querySelector("content");
        const rawContent = contentElement ? contentElement.textContent : '';
        
        // The content is HTML encoded, so we need a way to decode it.
        // A simple way is to use a textarea.
        const txt = document.createElement("textarea");
        txt.innerHTML = rawContent;
        const decodedContent = txt.value;

        const contentParser = new DOMParser();
        const contentDoc = contentParser.parseFromString(decodedContent, "text/html");

        const rawJa = contentDoc.querySelector("div.japanese.notranslate") ? contentDoc.querySelector("div.japanese.notranslate").textContent.trim() : '';
        const { ja, ja2, furigana, romaji } = splitJa(rawJa);

        const tagText = contentDoc.querySelector("div.tags") ? contentDoc.querySelector("div.tags").textContent : '';
        const tags = tagText
            .split(/\s+/)
            .filter(word => word.startsWith('#'))
            .map(tag => tag.slice(1));

        let definition = null;
        const hrElements = contentDoc.querySelectorAll('hr');
        if (hrElements.length >= 2) {
            const start = hrElements[0];
            const end = hrElements[1];
            let definitionHTML = '';

            let current = start.nextSibling;
            while (current && current !== end) {
                if (current.nodeType === Node.ELEMENT_NODE) {
                    definitionHTML += current.outerHTML;
                } else if (current.nodeType === Node.TEXT_NODE) {
                    definitionHTML += current.textContent;
                }
                current = current.nextSibling;
            }
            
            definition = htmlToMarkdown(definitionHTML.trim());
            definition = cleanSpacing(definition);
            
            /*const tempDiv = document.createElement('div');
            tempDiv.innerHTML = definitionHTML;
            // Replace </p> with line breaks, then strip all tags
            const withLineBreaks = tempDiv.innerHTML.replace(/<\/p>/gi, '</p>\n');
            tempDiv.innerHTML = withLineBreaks;
            definition = tempDiv.innerText.trim();*/
        }
        
        const titleElement = entry.querySelector("title");
        const title = titleElement ? titleElement.textContent : null;

        return {
            postId: postid,
            en: title,
            ja: ja,
            ja2: ja2,
            furigana: furigana,
            romaji: romaji,
            note: definition,
            context: tags.join(','),
            group: labels.join(',')
        };
    }

    return entries.map(parseEntry);
}

function cleanSpacing(input) {
  return input
    // Replace &nbsp; with a normal space
    .replace(/&nbsp;/g, ' ')
    // Remove spaces/tabs before newlines (but keep the newline)
    .replace(/[ \t]+\n/g, '\n')
    // Convert <br> tags to newlines
    .replace(/<br\s*\/?>/gi, '\n')
    // Collapse 3+ consecutive newlines into just 2
    .replace(/\n{3,}/g, '\n\n')
    // Trim leading/trailing whitespace
    .trim();
}




function htmlToMarkdown(html) {
  let md = html;

  // Headings <h1>..</h1> → # ...
  for (let i = 6; i >= 1; i--) {
    const regex = new RegExp(`<h${i}>(.*?)</h${i}>`, 'gi');
    md = md.replace(regex, (_, content) => `${'#'.repeat(i)} ${content}\n`);
  }

  // Ordered lists <ol><li>..</li></ol> → 1. ...
  md = md.replace(/<ol>([\s\S]*?)<\/ol>/gi, (_, listContent) => {
    const items = listContent.match(/<li>(.*?)<\/li>/gi) || [];
    return items.map((item, idx) => `${idx + 1}. ${item.replace(/<\/?li>/gi, '')}`).join('\n') + '\n';
  });

  // Unordered lists <ul><li>..</li></ul> → - ...
  md = md.replace(/<ul>([\s\S]*?)<\/ul>/gi, (_, listContent) => {
    const items = listContent.match(/<li>(.*?)<\/li>/gi) || [];
    return items.map(item => `- ${item.replace(/<\/?li>/gi, '')}`).join('\n') + '\n';
  });

  // Bold <strong>..</strong> → **..**
  md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');

  // Italic <em>..</em> → *..*
  md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');

  // Inline code <code>..</code> → `..`
  md = md.replace(/<code>(.*?)<\/code>/gi, '`$1`');

  // Links <a href="url">text</a> → [text](url)
  md = md.replace(/<a href="(.*?)">(.*?)<\/a>/gi, '[$2]($1)');

  // Summary paragraph <p class="summary">..</p> → plain + <!--more-->
  md = md.replace(/<p class="summary">(.*?)<\/p>\s*<!--more-->/gi, '$1\n');

  // Remove <a name="more"></a> tags
  md = md.replace(/<a\s+name=["']?more["']?\s*><\/a>/gi, '');


  // Regular paragraphs <p>..</p> → plain line
  md = md.replace(/<p>(.*?)<\/p>/gi, '$1\n');

  // Cleanup: remove extra newlines
  md = md.replace(/\n{2,}/g, '\n\n').trim();

  return md;
}
