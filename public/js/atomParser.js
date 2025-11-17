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
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = definitionHTML;
            // Replace </p> with line breaks, then strip all tags
            const withLineBreaks = tempDiv.innerHTML.replace(/<\/p>/gi, '</p>\n');
            tempDiv.innerHTML = withLineBreaks;
            definition = tempDiv.innerText.trim();
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
