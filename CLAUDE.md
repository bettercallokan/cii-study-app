# CII Study App — Claude Code Instructions

## CRITICAL: Design Regression Prevention

**The design in this repo has been finalized. Before making any changes, run:**
```bash
git log --oneline -10
git diff origin/main HEAD --stat
```
Always branch from the **latest commit on the current branch**, never from an older commit or a stale remote state.

### Protected Design Files

The following files contain finalized designs. **Do NOT regress or overwrite** them without explicit user instruction:

| File | Last finalized in | What to preserve |
|------|-------------------|------------------|
| `app/(main)/page.tsx` | `5d5827f` | Dashboard with progress cards, knowledge gaps, recent activity |
| `app/(main)/courses/page.tsx` | `5d5827f` | 3-course grid (W01/WUE/WCE) with colour-coded cards |
| `app/(main)/courses/[code]/page.tsx` | `1d3b577` | 3-tab layout: Overview / Units / Progress, full W01 unit structure |
| `app/(main)/practice-exams/page.tsx` | `5d5827f` | English UI, 2-column module card grid, Mini Tests / Mock Exams tabs |
| `app/(main)/courses/[code]/study/page.tsx` | `b77adc5` | Split layout: PDF viewer + mobile navigation |
| `components/app-sidebar.tsx` | `845adc0` | Header "CII Study/Exam Preparation"+×, Dashboard, Modules expandable (W01/WCE/WUE badges→/courses/code), Practice Exams, STUDY PDFS flat file list from Supabase Storage, Settings, user card |

### Sidebar nav items — EXACT list (do not add/remove without instruction)
Dashboard → `/`  
Modules (expandable) → W01 `/courses/w01`, WCE `/courses/wce`, WUE `/courses/wue`  
Practice Exams → `/practice-exams`  
STUDY PDFS (flat file list from Supabase Storage `pdfs` bucket)  
Settings → `/settings`  
**NOT in sidebar:** Flashcards, Analytics, Courses (standalone link)

### Route Structure
This app uses a `(main)` route group:
```
app/
  (main)/
    layout.tsx        ← sidebar wrapper
    page.tsx          ← dashboard /
    courses/
      page.tsx        ← /courses
      [code]/
        page.tsx      ← /courses/w01 etc.
        study/
          page.tsx    ← /courses/w01/study
    practice-exams/
      page.tsx
    flashcards/
      page.tsx
    analytics/
      page.tsx
    settings/
      page.tsx
  layout.tsx          ← root layout
```

### How Design Regressions Happen (and how to avoid them)

1. **Stale branch base**: A new Claude session creates a feature branch from an old commit. The branch is missing newer design commits. When the PR is merged, it brings in old file versions that overwrite the newer design.
   - **Fix**: Always check `git log --oneline origin/HEAD..HEAD` before starting work. If your branch is missing recent design commits, rebase onto the latest.

2. **Accidental file overwrite**: A task like "add feature X to sidebar" rewrites the whole file from scratch instead of editing the existing one.
   - **Fix**: Always `Read` a file before editing it. Use `Edit` (targeted diff) not `Write` (full overwrite) for existing files.

3. **Wrong base commit**: A new Claude session starts from an unrelated/older branch (e.g. `6a5909e`) instead of the correct working branch (`claude/supabase-storage-integration-dkEHK` at `1d3b577`).
   - **Fix**: Always check all remote branches with `git branch -av` and identify the most advanced working state before starting work.

4. **PR merge conflict resolved wrong**: During a merge, the "ours" version (old) wins over "theirs" (new design).
   - **Fix**: When resolving conflicts in the protected files above, always keep the NEWER version (the one with more content/features).

---

## Project Overview

CII Study App — a Next.js 15 / Supabase study platform for CII (Chartered Insurance Institute) exam preparation.

**Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase (PostgreSQL + Storage), PDF viewer

**Courses:** W01 (Award in General Insurance), WUE (Insurance Underwriting), WCE (Insurance Claims Handling)

---

## Database Schema

### Key tables
- **modules** — `id, title (JSONB {en, tr}), order_index, is_active, version`
- **lessons** — `id, module_id, title (JSONB {en, tr}), content (JSONB), summary_content (JSONB), knowledge_level, order_index`
- **flashcards** — `id, module_id, lesson_id, front (JSONB {en, tr?}), back (JSONB {en, tr?}), tags`
- **questions** — for practice exams
- **profiles** — user profiles with `preferred_language`, `is_admin`

### summary_content JSONB structure
```json
{
  "en": {
    "content": {
      "overview": "string",
      "key_points": ["string"],
      "study_note": "string"
    },
    "summary_cards": [{ "title": "string", "body": "string" }],
    "insights": [{ "tag": "string", "title": "string", "body": "string", "exam_critical": true }]
  }
}
```

### Updating summary_content via SQL
Use title keyword search (without letter prefix) to avoid ILIKE mismatch:
```sql
-- CORRECT: flexible pattern without "A: " prefix
UPDATE lessons SET summary_content = '...'::jsonb
WHERE title->>'en' ILIKE '%role of risk in insurance%';

-- WRONG: assumes exact prefix format
WHERE id = (SELECT id FROM lessons WHERE title->>'en' ILIKE '%A: The role%' LIMIT 1);
```

---

## Supabase

**Client:** `utils/supabase/client.ts` (not `lib/supabase.ts`)

PDFs are stored in the `pdfs` bucket at the root level (no subfolders).
The sidebar fetches them via `supabase.storage.from("pdfs").list("")`.

---

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
