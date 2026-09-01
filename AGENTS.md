# AGENTS.md

Instructions for AI coding agents working in this repository.  
**Read this file before making any change.** Rules here override default assumptions.

---

## 1. What this project is

**Civil Law Reader** — a personal, offline-first web app for reading the Thai Civil and
Commercial Code (ประมวลกฎหมายแพ่งและพาณิชย์) while preparing for law exams.

Current status: **UX/UI prototype**. All legal content is small mock data.

Stack: React 18 + TypeScript + Vite 5 + React Router 6 + plain CSS.  
No backend. No database. No API. No network calls.

---

## 2. Hard rules (never break these)

### 2.1 Do not hard-code legal text inside UI components
Legal text (มาตรา, ตัวบท, ฎีกา) must **never** appear as a string literal in
`src/components/`, `src/pages/`, or `src/layouts/`.

All legal content lives in `src/data/` only:

| File | Contains |
|---|---|
| `src/data/codeTree.ts` | Hierarchy: บรรพ → ลักษณะ → หมวด → ส่วน |
| `src/data/articles.ts` | Article text, keyed by article number |
| `src/data/decisions.ts` | Supreme Court decisions (ฎีกา) |
| `src/data/meta.ts` | Code title, tagline, database version/date |

```tsx
// ❌ WRONG — legal text inside a component
<p>มาตรา 150 การใดมีวัตถุประสงค์เป็นการต้องห้ามชัดแจ้งโดยกฎหมาย…</p>

// ✅ CORRECT — component reads from the data layer
const article = getArticle(articleId);
{article.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
```

UI **labels** (e.g. `"ค้นหา"`, `"ฎีกาที่เกี่ยวข้อง"`, `"บันทึกแล้ว"`) are not legal
content and may stay in components.

### 2.2 Keep legal data separate from UI and application logic
Three layers, one direction of dependency:

```
src/data/   →   src/lib/   →   src/pages/ + src/components/
(raw data)      (index,        (presentation only)
                 search,
                 format)
```

- `src/data/` — plain exported constants. No imports from `lib`, `pages`, or `components`.
- `src/lib/` — pure functions only. No JSX, no React hooks, no DOM access.
- `src/pages/` + `src/components/` — never reach into `src/data/` for legal content
  directly; go through `src/lib/lawIndex.ts`.

Exception: `src/data/meta.ts` (app title, tagline) may be imported by pages directly.

### 2.3 Mock data only, and keep it small
Do not bulk-generate or paste large volumes of legal text. The current mock set exists
to exercise the UI, not to be a real legal reference.

If you add examples, keep them:
- short (1–2 sentences per article),
- suffixed with `(ข้อความย่อสำหรับต้นแบบ)` so nobody mistakes them for the real text,
- limited to a handful of new entries per change.

### 2.4 Do not fetch legal data from external websites
No scraping, no crawling, no API integration, no CDN-hosted datasets — **unless the
maintainer explicitly instructs it in the task**.

Forbidden without explicit instruction:
- `fetch` / `axios` / `XMLHttpRequest` calls to any legal source
- build scripts that download data
- adding remote fonts, analytics, telemetry, or error-reporting services

### 2.5 Keep the app offline-first
The app must run fully with no network connection, on first load, forever.

- Legal data is bundled with the app. It is never loaded asynchronously.
- **Do not add loading spinners or skeleton screens for legal content.** Reading a
  มาตรา must be instant and synchronous.
- The "ฐานข้อมูลอัปเดต …" line on the home screen is a **static placeholder**.
  Do not wire it to a real update system unless explicitly asked.
- User state (bookmarks, recent, theme) lives in `localStorage` only, and never leaves
  the device.

### 2.6 Do not change the legal data structure without documenting it
`src/types/law.ts` is the contract. If a task genuinely requires changing
`LawNode`, `Article`, or `Decision`, you must in the same commit:

1. update `src/types/law.ts` with doc comments explaining the new field,
2. update `src/lib/lawIndex.ts` so the index still builds,
3. migrate every entry in `src/data/`,
4. update the "โครงสร้างข้อมูลกฎหมาย" section in `README.md`,
5. note the change in the PR/commit description.

Never leave the codebase in a state where `codeTree.ts` and `articles.ts` disagree.

### 2.7 The legal hierarchy is irregular — never assume all levels exist
Real structure: `บรรพ → ลักษณะ → หมวด → ส่วน → มาตรา`, but levels are frequently
skipped. A node may have `children`, or `articleIds`, or **both**.

Any code touching the tree must handle all cases:

```tsx
// ✅ handles both, and neither
{children.length > 0 && <NodeList nodes={children} />}
{node.articleIds.length > 0 && <ArticleList ids={node.articleIds} />}
```

Never hard-code "ส่วน always exists" or "ลักษณะ always has หมวด".
`NodePage.tsx` renders every level with one component — keep it that way.

### 2.8 Keep components modular and reusable
- One component per file, named export, filename matches the component.
- Components receive data via props; they do not import mock data themselves.
- Reuse before creating: `NavRow`, `ArticleRow`, `DecisionRow`, `BookmarkButton`,
  `Breadcrumbs`, `FilterChips`, `EmptyState`, `SectionHeading`, `PrevNextBar`, `Icon`.
- Shared UI logic → `src/components/`. Shared non-UI logic → `src/lib/`.
- Pages compose components. Pages should not contain complex layout primitives.

### 2.9 Follow the existing UX/UI design
Do not redesign unless explicitly instructed. The established design language:

- Minimal, black-and-white, high contrast. No gradients, no shadows, no decoration.
- **Hairline-separated rows, not cards.** Do not convert lists into card grids.
- Not a dashboard: no charts, no stat tiles, no widgets.
- Mobile-first single column, max width `--app-width` (520px), centered.
- Light mode default, dark mode supported via `[data-theme]`.
- Legal text and ฎีกา must stay visually separated (thick divider, see `SectionHeading`
  with `divider`). Never blend them into one continuous block.
- Colors, spacing, and reader typography come from `src/styles/tokens.css`.
  **Do not introduce new hard-coded hex colors or px sizes in component CSS** — add or
  reuse a token instead.

### 2.10 Do not add unnecessary dependencies or features
Before adding any npm package, ask: can plain React/CSS do this in under ~100 lines?
If yes, do that instead.

Explicitly **not wanted** in this project:
- UI/component libraries, CSS-in-JS, Tailwind, icon packages
- state management libraries (Context is enough)
- analytics, telemetry, error reporting, service integrations
- **user accounts, login, profiles, notifications, social features, sharing feeds,
  comments, likes** — this is a private single-user reading tool
- any edit/create/delete UI for legal content (it is strictly read-only)

Adding a dependency requires justification in the PR description.

### 2.11 Prioritize mobile usability and Thai readability
- Test at 360×640 first. Every interactive element ≥ 44×44 px effective touch target.
- Search must stay reachable: tab bar + header search icon. Do not bury it.
- Returning from a มาตรา to its หมวด/ส่วน must stay one tap (breadcrumbs + back).
- Continuous reading via prev/next must keep working across หมวด and บรรพ boundaries.
- Thai text needs generous line-height. Reader text uses `--reader-size` /
  `--reader-line-height` (3 user-selectable steps). Never set a fixed `font-size` on
  legal body text.
- Do not add `text-transform: uppercase` or heavy `letter-spacing` to Thai text.
- Use only locally available fonts. No webfont downloads.

---

## 3. Where to put new code

| Task | Location |
|---|---|
| Add/edit legal content | `src/data/` |
| Change data shape | `src/types/law.ts` (+ document it) |
| Lookup, traversal, search, formatting | `src/lib/` |
| Bookmarks, recent, theme, toast | `src/store/` |
| Routes, tab bar | `src/navigation/` |
| Page shell, header | `src/layouts/` |
| Reusable UI piece | `src/components/` |
| A new screen | `src/pages/` + register in `src/App.tsx` + `src/navigation/routes.ts` |
| Colors, spacing, typography scale | `src/styles/tokens.css` |

Always build URLs with the `routes` helper in `src/navigation/routes.ts`.
Never write a path string like `` `/article/${id}` `` inline.

---

## 4. Definition of done

Every change must pass before you report completion:

```bash
npm run typecheck   # must pass — no `any`, no ts-ignore
npm run lint        # must pass
npm run build       # must succeed
npm run dev         # manually verify the affected flow
```

And manually verify the three core flows still work:

1. Home → สารบัญ → บรรพ → ลักษณะ → หมวด → ส่วน → รายการมาตรา → หน้ามาตรา → ฎีกา
2. Home → ค้นหา → ผลลัพธ์ (มาตรา / ฎีกา / สารบัญ) → หน้าปลายทาง
3. Home → บันทึก → มาตรา/ฎีกา ที่บันทึกไว้ → หน้ามาตรา → ลบบุ๊กมาร์ก

Also check: dark mode toggle, font-size cycling on the article page, prev/next at the
first and last article (must be disabled, not crash).

---

## 5. Scope discipline

- Change only what the task requires. No drive-by refactors, no reformatting unrelated files.
- Do not upgrade dependencies unless that is the task.
- Do not delete or rewrite mock data that a task did not mention.
- If a request conflicts with a rule in this file, **say so and ask** before proceeding.
- If a request would require network access to legal sources, **stop and ask**.

---

## 6. Legal disclaimer for agents

The content in this repository is **not** an authoritative legal source. Do not
present generated or reproduced legal text as accurate, and do not remove the
disclaimer in `README.md` or the `(ข้อความย่อสำหรับต้นแบบ)` markers in mock data.