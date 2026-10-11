# Vocarb
> Minimalist Arabic–Chinese vocabulary flashcards.

**Live: [vocarb.vercel.app](https://vocarb.vercel.app/)**

A single-page flashcard app for studying Arabic vocabulary with Chinese and English translations. Built for a small class: anyone can study and takequizzes, while the word bank is managed by the owner through a hidden admin mode. Vocabulary lives in Supabase (PostgreSQL), English meanings are fetched through a free keyless translation API via a Vercel serverless function, and new words are added inside the app.

---

## Features

### Flashcards
- **Bulk import** — paste a weekly word list (Chinese + Arabic per line); the parser handles numbered and bulleted WhatsApp-style lists, auto-swaps reversed sides, strips cross-script contamination (e.g. a stray Chinese character inside an Arabic word), extracts ج. plural forms, and auto-generates pinyin
- **Sets** — organize words into sets (Week 12, Week 13, …) or review everything
- **Both directions** — CN → AR or AR → CN; pinyin shown above Chinese, full harakat on the Arabic
- **Keyboard-first** — Space to flip, arrow keys to navigate
- **Shuffle** for randomized review
- **Responsive** — works on desktop and mobile
- **English meanings** — machine-translated on import, shown alongside the Chinese

### Test mode
- Tick any combination of sets, choose direction (CN → AR, AR → CN, or Mix) and length (10 / 20 / All) — always shuffled
- Four-option multiple choice; distractors drawn from the selected word pool
- Instant right/wrong feedback with auto-advance
- Results screen: score, percentage, a "Focus on these" list of every missed word, and one-click Retry mistakes

### Admin (owner only)
- Unlocked by visiting /#admin and signing in — write access is enforced server-side by Supabase row-level security, not by hiding buttons
- **Add Words** with live preview and per-word editable English before saving
- **Word Bank**: click-to-edit English, delete words, fill in missing English, re-translate all English

### Feedback
- Built-in contact form (name / email / message → owner's inbox via FormSubmit), a dismissible feedback banner, and footer email links


---

## Tech stack
| Layer | Tool |
| :--- | :--- |
| **Frontend** | Single-file static HTML/CSS/JS (`index.html`) |
| **Database** | Supabase (PostgreSQL + row-level security) |
| **Auth** | Supabase email/password |
| **Hosting** | Vercel |
| **Pinyin** | `pinyin-pro` |
| **Fonts** | Amiri (Arabic) · Noto Serif SC (Chinese) |
| **Translation** |	MyMemory public API — free, keyless |
| **Serverless** | Vercel function (api/translate.js) — input validation + translation proxy |

---

## Database Schema
| Column | Type | Notes |
| :--- | :--- | :--- |
| **id** | uuid | Primary key |
| **set_name** | text | Set label, e.g. Week 12 |
| **zh** | text | Chinese |
| **pinyin** | text | Auto-generated on import |
| **en** | text	| English meaning — machine-translated, editable by admin |
| **ar** | text | Arabic (with harakat) |
| **plural** | text | Extracted from ج. notation |
| **created_at** | timestamptz | Insertion time |


---

## Usage

### Studying
Pick a set (or All words), choose a direction, flip through cards with Space and the arrow keys. Shuffle randomizes the order.

### Keyboard shortcuts
| Key | Action |
| :--- | :--- |
| **Space** | Flip card |
| **← / →** | Prev / next |

### Testing
Test → tick the sets to include → choose direction and length → answerwith clicks or keys 1–4. Missed words are listed at the end for review.

### Admin (owner-only)
1. Visit vocarb.vercel.app/#admin and sign in.
2. **+ Add Words** → paste the list, one entry per line: Numbering, bullets, and messy spacing are cleaned automatically. English auto-fills (click any of it in the preview to correct).
3. **Word Bank** → edit English inline, delete words, or batch-translate.

---

## Versioning
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

All notable changes are documented in [CHANGELOG.md](https://github.com/zihanlei/vocarb/blob/main/CHANGELOG.md)

## License
[MIT](https://github.com/zihanlei/vocarb/blob/main/LICENSE)
