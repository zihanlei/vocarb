/* Vocarb — /api/translate (free, keyless — MyMemory public API)
   Improvements over v1:
   - Entries are split on 、，,; into separate senses, each translated
     on its own, then joined with "; " (no more "X and Y" or sentence fragments)
   - Duplicate glosses are dropped (增多、增加 → "increase", not "increase; increase")
   - Trailing punctuation stripped; ALL-CAPS/title-case normalized to dictionary style
   - If every segment of an entry fails, falls back to translating the whole entry
*/

export const maxDuration = 30;

const EMAIL = "zihanlei0512@gmail.com"; // raises MyMemory quota 5k → 50k chars/day
const TIMEOUT_MS = 8000;
const SEG_SPLIT = /[、，,;；]/;

function clean(t, src){
  let s = String(t || '').trim();
  if (!s) return '';
  if (/MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID LANGUAGE/i.test(s)) return '';
  s = s.replace(/^["“”'‘’]+|["“”'‘’]+$/g, '').replace(/\s+/g, ' ').trim();
  if (!s || s === src) return '';
  if (/^[A-Z][a-z]/.test(s)) s = s[0].toLowerCase() + s.slice(1); // dictionary style
  s = s.replace(/[,;:.、]+$/, '').trim();                          // trailing punctuation
  return (!s || s === src) ? '' : s;
}

async function askMyMemory(text, langpair){
  const url = 'https://api.mymemory.translated.net/get'
    + `?q=${encodeURIComponent(text)}&langpair=${langpair}`
    + `&de=${encodeURIComponent(EMAIL)}&mt=1`;
  const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!r.ok) throw new Error('MyMemory HTTP ' + r.status);
  return r.json();
}

async function translateOne(text){
  for (const pair of ['zh|en', 'zh-CN|en']) {
    try {
      const d = await askMyMemory(text, pair);
      const t = clean(d?.responseData?.translatedText, text);
      if (t) return t;
    } catch (e) { /* next pair */ }
  }
  return '';
}

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { words } = req.body || {};
  if (!Array.isArray(words) || !words.length || words.length > 60 || words.some(w => typeof w !== 'string' || w.length > 100))
    return res.status(400).json({ error: 'Expected { words: string[] } with at most 60 short strings' });

  /* flatten into per-sense jobs */
  const jobs = [];
  words.forEach((w, wi) => {
    const segs = w.split(SEG_SPLIT).map(s => s.trim()).filter(Boolean);
    (segs.length ? segs : [w]).forEach(s => jobs.push({ wi, text: s }));
  });

  const results = new Array(jobs.length).fill('');
  let pos = 0;
  const worker = async () => { while (pos < jobs.length) { const k = pos++; results[k] = await translateOne(jobs[k].text); } };
  await Promise.all(Array.from({ length: Math.min(8, jobs.length) }, worker));

  /* reassemble per word, dropping duplicate glosses */
  const out = new Array(words.length).fill('');
  const done = new Set();
  for (let wi = 0; wi < words.length; wi++) {
    const parts = [], seen = new Set();
    jobs.forEach((j, k) => {
      if (j.wi !== wi) return;
      const t = results[k];
      if (!t) return;
      const key = t.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key); parts.push(t);
    });
    if (parts.length) { out[wi] = parts.join('; '); done.add(wi); }
  }

  /* whole-entry fallback for words whose segments all failed */
  for (let wi = 0; wi < words.length; wi++) {
    if (!done.has(wi)) out[wi] = await translateOne(words[wi]);
  }

  if (out.every(t => !t))
    return res.status(502).json({ error: 'Translation service returned nothing usable — try again in a minute (you can still save; English can be added later).' });
  return res.status(200).json({ translations: out, via: 'mymemory' });
}