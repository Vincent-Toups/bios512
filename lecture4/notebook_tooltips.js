(function() {
  const GLOSSARY_URL = 'files/technical-terms.md';
  const EXCLUDE = new Set(['CODE','PRE','KBD','SAMP','VAR','ABBR','A']);

  function escapeRegExp(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}

  function parseGlossary(mdText) {
    const map = new Map();
    mdText.split(/\r?\n/).forEach(line => {
      let m = line.match(/^\s*-\s*\*\*(.+?)\*\*:\s*(.+)\s*$/); // bold term
      if (!m) m = line.match(/^\s*-\s*`(.+?)`:\s*(.+)\s*$/);       // code term
      if (m) map.set(m[1], m[2]);
    });
    return map;
  }

  function wrapTextNode(node, terms, defs, defsLC) {
    const text = node.nodeValue;
    let replaced = false;
    // Build a combined regex to scan once: longest terms first
    const pattern = terms.map(t => `\\b${escapeRegExp(t)}\\b`).join('|');
    if (!pattern) return false;
    const re = new RegExp(pattern, 'gi');
    let lastIndex = 0;
    const frag = document.createDocumentFragment();
    let m;
    while ((m = re.exec(text)) !== null) {
      const match = m[0];
      const start = m.index;
      const end = start + match.length;
      if (start > lastIndex) frag.appendChild(document.createTextNode(text.slice(lastIndex, start)));
      const abbr = document.createElement('abbr');
      abbr.className = 'glossary-term';
      const keyLC = match.toLowerCase();
      abbr.title = defsLC.get(keyLC) || defs.get(match) || '';
      abbr.textContent = match;
      frag.appendChild(abbr);
      lastIndex = end;
      replaced = true;
    }
    if (replaced) {
      if (lastIndex < text.length) frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      node.parentNode.replaceChild(frag, node);
    }
    return replaced;
  }

  function walk(el, terms, defs, defsLC) {
    if (EXCLUDE.has(el.nodeName)) return;
    for (let n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === Node.TEXT_NODE) {
        wrapTextNode(n, terms, defs, defsLC);
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        walk(n, terms, defs, defsLC);
      }
    }
  }

  function apply(defs) {
    // Sort by length desc to prefer longer matches; store list for regex
    const terms = Array.from(defs.keys()).sort((a,b)=> b.length - a.length);
    const defsLC = new Map(Array.from(defs.entries()).map(([k,v]) => [k.toLowerCase(), v]));
    document.querySelectorAll('.text_cell_render').forEach(el => walk(el, terms, defs, defsLC));
  }

  function injectStyle() {
    const style = document.createElement('style');
    style.textContent = 'abbr.glossary-term{ text-decoration: underline dotted; cursor: help; }';
    document.head.appendChild(style);
  }

  function init(glossaryUrl) {
    injectStyle();
    fetch(glossaryUrl)
      .then(r => r.ok ? r.text() : Promise.reject(new Error('Glossary fetch failed')))
      .then(md => {
        const defs = parseGlossary(md);
        apply(defs);
        // Re-apply when markdown is rendered again (e.g., after execution)
        if (window.require) {
          try {
            require(['base/js/events'], function(events){
              events.on('rendered.MarkdownCell', function(){ apply(defs); });
            });
          } catch (e) { /* ignore */ }
        }
      })
      .catch(err => console.warn('[tooltips] ', err));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(GLOSSARY_URL));
  } else {
    init(GLOSSARY_URL);
  }
})();
