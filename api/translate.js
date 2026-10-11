/* Vocarb — /api/translate (100% free, no keys, no accounts, no env vars)
   Receives: POST { words: ["提供、具备", ...] }   (max 60)
   Returns:  { translations: [...], via: "mymemory" }

   Uses the MyMemory public translation API. Free tier: 50,000 chars/day
   when a contact email is supplied (we supply yours — it's already public
   in the site footer). A weekly import of ~30 words is ~200 chars, so
   quota will never realistically be hit.

   If a word comes back unusable (quota text, echoed input, empty), that
   word is returned as "" — the app shows an empty editable English slot
   for it instead of failing the whole import.
*/

export const maxDuration = 30;

const EMAIL = "zihanlei0512@gmail.com"; // raises MyMemory quota from 5k → 50k chars/day
const TIMEOUT_MS = 8000;

function clean(t, src){
  let s = String(t || '').trim();
  if (!s) return '';
  if (/MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID LANGUAGE/i.test(s)) return '';
  s = s.replace(/^["“”'‘’]+|["“”'‘’]+$/g, '').replace(/\s+/g, ' ').trim();
  if (!s || s === src) return '';                       // empty or echoed input
  if (s === s.toUpperCase() && /[A-Z]/.test(s))         // MyMemory sometimes shouts
    s = s.toLowerCase().replace(/(^|[.;:]\s*)[a-z]/g, m => m.toUpperCase());
  return s;
}

async function askMyMemory(text, langpair){
  const url = 'https://api.mymemory.translated.net/get'
    + `?q=${encodeURIComponent(text)}&langpair=${langpair}`
    + `&de=${encodeURIComponent(EMAIL)}&mt=1`;
  const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!r.ok) throw new Error('MyMemory HTTP ' + r.status);
  return r.json();
}

async function translateOne(word){
  for (const pair of ['zh|en', 'zh-CN|en']) {           // second pair = safety net
    try {
      const d = await askMyMemory(word, pair);
      const t = clean(d?.responseData?.translatedText, word);
      if (t) return t;
    } catch (e) { /* try the next pair */ }
  }
  return '';
}

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { words } = req.body || {};
  if (!Array.isArray(words) || !words.length || words.length > 60 || words.some(w => typeof w !== 'string' || w.length > 100))
    return res.status(400).json({ error: 'Expected { words: string[] } with at most 60 short strings' });

  const out = new Array(words.length).fill('');
  let pos = 0;
  const worker = async () => { while (pos < words.length){ const i = pos++; out[i] = await translateOne(words[i]); } };
  await Promise.all(Array.from({ length: Math.min(6, words.length) }, worker));

  if (out.every(t => !t))
    return res.status(502).json({ error: 'Translation service returned nothing usable — try again in a minute (you can still save; English can be added later).' });
  return res.status(200).json({ translations: out, via: 'mymemory' });
}