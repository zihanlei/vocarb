# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-10-11

### Added
**Public access and admin:**
- Public class access — the login page is gone; anyone can study and take tests without an account.
- Admin mode via the #admin URL hash — an inline Supabase sign-in unlocks Add Words and the Word Bank. Row-level security switched to public-read / admin-write, so every write stays owner-only at the database level; public sign-ups remain disabled.

**Test mode:**
- Dedicated test section: tick any combination of sets, choose direction (CN → AR / AR → CN / Mix, where Mix randomizes per question), and length (10 / 20 / All); questions are always shuffled.
- Four-option multiple choice with distractors sampled from the selected word pool, so tests sharpen automatically as the vocabulary grows.
- Instant right/wrong feedback (green/red) with auto-advance; keyboard answering via 1–4.
- Results screen: score, percentage, a "Focus on these" list of every missed word shown in full card form, and a Retry-mistakes button that re-tests only the missed words. Nothing is persisted between sessions.

**English meanings pipeline:**
- New en column displayed alongside the Chinese on cards and in the word bank; optional pipe import format (中文 | English | العربية).
- /api/translate Vercel serverless function — free, keyless machine translation via the MyMemory public API (no API keys, no accounts, no environment variables).
- Sense segmentation: entries are split on 、，,; and each sense translated independently, duplicate glosses dropped, trailing punctuation stripped, output normalized to dictionary style (增多、增加 → "increase"; 引起、挑起 → "cause; provoke").
- Whole-entry fallback when every segment of an entry fails; per-word empty results degrade gracefully instead of failing the import.
- "Fill in missing English" and "Re-translate all English" batch actions in the Word Bank for backfilling and refreshing existing rows.
- Click-to-edit English in the Word Bank, saved directly to the database — manual corrections persist.

**Smarter bulk import:**
- The parser strips numbering and bullets, tolerates messy WhatsApp formatting, extracts parenthetical pinyin, deduplicates lines, and auto-removes cross-script contamination (e.g. a stray Chinese character inside an Arabic word).

**Feedback:**
- Contact page (name / email / message delivered to the owner's inbox via FormSubmit) with graceful fallback messaging, plus a prominent dismissible feedback banner and footer email links.

**Fixed:**
- Dialogs (contact, admin sign-in, add words, word bank) were pinned to the top-left corner: the global CSS margin reset had removed the browser's default dialog centering; restored with margin: auto.
- The #admin hash remained in the URL after entering or leaving admin mode; it is now cleared from the address bar.

**Changed:**
- Plural forms display inline with the singular at equal size and weight, separated by ·, instead of being shrunk and greyed out.
- Auto-translated glosses are lowercase, semicolon-separated dictionary entries rather than raw sentence translations.


## [1.0.0] - 2026-10-04

### Added
**Flashcards and Study:**
- Minimalist single-page flashcard app for Arabic–Chinese vocabulary, rendered as one static HTML file with no build step.
- 3D flip animation (CSS transforms) with a warm paper palette; Amiri for Arabic (full harakat), Noto Serif SC for Chinese, pinyin shown above the Chinese.
- Bilingual study directions — CN → AR and AR → CN — with the preference persisted per device via localStorage.
- Keyboard-first controls: Space flips the card, ← / → navigate with wraparound; on-screen navigation buttons for touch/mobile.
- Shuffle (Fisher–Yates) for randomized review order.
- Progress indicator: card counter plus a thin progress bar.
- Small hint on the answer side showing the prompt word for self-checking.
- Responsive layout down to mobile; prefers-reduced-motion disables animations.

**Vocabulary Management:**
- Bulk import dialog: paste one word per line and the parser splits Chinese from Arabic automatically (mixed-script lines, tab, and | separators supported; sides auto-swapped if pasted in reverse; # lines ignored).
- Automatic pinyin generation at import time via pinyin-pro, with a fallback that preserves manually typed pinyin.
- Arabic plural extraction: "، ج. X" notation is split into a dedicated plural column and displayed beneath the singular.
Pre-save preview showing every recognized word (with pinyin and plural) plus a count of skipped lines.
- Sets: arbitrary set names (e.g. "Week 12") with an autocomplete list of existing sets, an "All words" combined view, and the last-selected set persisted between visits.
- Word Bank dialog listing all words in the current set with per-word delete (with confirmation).

**Accounts and Data:**
- Persistence in Supabase (PostgreSQL): a single words table (set_name, zh, pinyin, ar, plural, created_at).
- Email/password authentication with sessions persisting across reloads; login errors mapped to plain-English messages.
- Row-level security enabled — all reads and writes restricted to authenticated users only; public sign-ups disabled (accounts created manually in the Supabase dashboard).
- Toast notifications for save / delete / load outcomes, including raw database errors when they occur.

**Deployment and Infrastructure:**
- Hosted on Vercel with automatic deploys on every push to the production branch.
- App served at the root URL (vocarb.vercel.app) directly via index.html.
- CDN dependencies only: supabase-js, pinyin-pro, Google Fonts (Amiri, Noto Serif SC).
- README with full setup guide (Supabase + Vercel), usage guide, and MIT license.
