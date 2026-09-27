# Repository Guidelines

## Project Structure & Module Organization

- `apps/web/` is the main Next.js 16 app (App Router). UI lives in `components/`, feature modules in `features/`, shared hooks in `hooks/`, derived data in `data/`, and utilities in `utils/`/`lib/`.
- `apps/web/public/` contains static data used at runtime (for example `problemset/` and `studyplan/`).
- `apps/web/lc-parser/` holds the TypeScript HTML→Markdown parser; `apps/web/lc-maker/` holds Python sync/translation scripts.
- `apps/web/scripts/` holds the 講義 authoring and validation tooling, plus the Markdown authoring source under `lecture_content/`.
- `packages/` holds shared configs and UI primitives (`eslint-config/`, `tailwind-config/`, `typescript-config/`, `ui/`).

## Build, Test, and Development Commands

Run from repo root unless noted.

- `pnpm install` installs workspace dependencies.
- `pnpm dev` starts all dev tasks via Turbo; the web app runs at `http://localhost:3001`.
- `pnpm build` builds all packages/apps with Turbo.
- `pnpm lint` runs ESLint in the workspace.
- `pnpm check-types` runs Next type generation and `tsc --noEmit`.
- `pnpm format` formats `*.ts`, `*.tsx`, and `*.md` with Prettier. `.prettierignore`
  keeps it away from `scripts/lecture_content/` and `public/studyplan/`: Prettier
  rewrites `*emphasis*` to `_emphasis_` and then escapes underscores, which turns
  `$P_i = (P_{i-1} + 1)$` into `$P*i = (P*{i-1} + 1)$` and silently breaks the KaTeX.

## 講義課節骨架（與 competitive-programming-handbook 對齊）

`apps/web/features/lecture/content/` 的每一小節都採用 competitive-programming-handbook 的課節骨架。handbook 的 109 篇課節全部帶同一組標題、同一個順序，lc-rating 的講義照做。

必備標題（依序）：

1. `## 這個技術解決什麼問題` — 暴力做法為何不夠，這個技巧的槓桿在哪。
2. `## 辨識題型的訊號` — 看到什麼特徵就該想到它。
3. `## 核心想法與直覺`
4. `## 狀態／資料結構定義` — 變數、容器、區間語意、上下界。
5. `## 不變量或正確性證明` — 迴圈不變量、交換論證、歸納法。**這是骨架裡最有價值的一節，不要寫成複述步驟。**
6. `## 逐步演算法`
7. `## C++17 模板`
8. `## 時間與空間複雜度` — 含推導理由（例如均攤為何成立），不只給結果。
9. `## 常見錯誤與邊界條件` — 一個坑一個 bullet。不要用「；」把多個坑串成一段。
10. `## 與相似技巧的比較` — 和鄰近技巧的取捨。
11. `## 例題與分級練習`
12. `## 本節重點速查` — 用精簡 Markdown bullet list 收尾；每點只放一個可帶走的不變量、前提、複雜度或實作警告。

lc-rating 另有三個 handbook 沒有的標題，位置固定：`## 程式碼拆解`（緊接在 C++17 模板之後）、`## 常見變形`（常見錯誤與邊界條件之後）、`## 代表例題`（例題與分級練習之前）。

工具（在 `apps/web/` 下執行）：

- `npx tsx scripts/validateLectureSkeleton.mjs` — 回報各主題完成度。加 `--strict` 會在標題缺漏、順序錯誤、Markdown-backed 課節仍是自由散文、重點速查不是 bullet list，或常見錯誤用「；」串成長段時失敗；可接主題名稱只看單一主題。
- `npx tsx scripts/validateContentFormatting.mjs` — 檢查所有講義、題單與 Markdown authoring source 的 KaTeX、數學分隔符與 code fence。
- `npx tsx scripts/applyLectureSections.mjs additions.json` — 套用撰寫好的小節並強制標題順序。JSON 格式是 `{ 主題: { 小節標題: { 標題: markdown } } }`。不帶參數則只重新排序。
- `scripts/lectureSkeleton.mjs` — 標題清單與順序的單一事實來源。

尚未補齊的小節仍只有骨架的一部分；補寫時整節一次補到齊，並用 `--strict` 確認。

## 講義書籍版（PDF）

`apps/web/scripts/book/` 把 13 個講義主題排成一本可送印的書（封面、目錄、圖目錄、四篇十三章、題號索引、約 180 幅圖解）。在 `apps/web/` 下：

- `pnpm book:pdf` 產生 `book-dist/lc-lecture-book.pdf`（`--volumes` 另拆分冊、`--chapters a,b` 只排部分章節）。`book-dist/` 已列入 `.gitignore`，不要提交 PDF。
- `pnpm book:figures` 把所有圖解輸出到一個 HTML 頁面檢查。
- 圖解登記在 `scripts/book/figures/part*.ts`，以「主題 + 小節標題（含編號）」對應；**改小節標題時要同步改圖的 `section`**，否則建置會警告找不到小節。圖中數值一律由程式跑演算法計算。
- 細節見 `apps/web/scripts/book/README.md`。

## Coding Style & Naming Conventions

- Use TypeScript, React, and Tailwind CSS conventions already in the codebase.
- Indentation and formatting are handled by Prettier (run `pnpm format`).
- Components use PascalCase (for example `ContestTable.tsx`); hooks use `useX` naming (for example `useProgress`).
- Keep files colocated by feature under `apps/web/features/`, with shared UI in `apps/web/components/` and shared hooks in `apps/web/hooks/`.

## Testing Guidelines

- There is no general test suite; rely on `pnpm lint` and `pnpm check-types` for CI safety.
- A parser test exists: `pnpm --filter web test` (uses `apps/web/lc-parser/`).
- `pnpm --filter web test:unit` runs the TypeScript unit tests.
- `cd apps/web/lc-maker && python -m unittest test_merge_upstream_to_local.py` runs the study-plan overlay tests.

## 題單小節導讀（`public/studyplan/*.json`）

This is a **separate surface** from the 講義 above. Do not confuse the two:

- 講義 = `apps/web/features/lecture/content/*.ts`, served by `useTutorial` at
  `/lecture/[category]/[section]`. The skeleton documented above governs it.
- 題單 = `apps/web/public/studyplan/*.json`, fetched by `useStudyPlan`. Each
  leaf section's `summary` is the prose shown above that section's problem
  table, rendered by `HandbookSectionBody`.

The 12 plans shared with `huxulm/lc-rating` are localized overlays: upstream
owns problem membership, mutable problem metadata, and short summaries; this
fork preserves Traditional Chinese, stable numeric section IDs/hierarchy,
reviewed corrections, and local-only problems. Full teaching prose belongs in
the TypeScript lectures, including `graph` and `sliding_window`.

Do not hand-edit the 12 shared JSON files. Synchronize them through
`apps/web/lc-maker/merge_upstream_to_local.py`; use `--dry-run` to preview and
`--check` to verify idempotence. The seven plans with no upstream counterpart
(`weekly_contest`, `rating_2100`, `q3_handbook`, `q4_handbook`,
`technical_interview`, `interview_sprint`, and `sorting`) remain local-owned.

Content rules:

- Inline math uses `$…$` (KaTeX runs with `nonStandard: true`).
- A markdown table only becomes an interactive problem list when its header has
  both an ID column (`ID`/`LC ID`/`題號`) and a title column
  (`Problem`/`Title`/`題目`/`題名`); other tables render as plain tables.

## Commit & Pull Request Guidelines

- Commit messages are short and often use prefixes like `fix:`; keep them descriptive (for example `fix: correct rating filter`).
- Data updates may use `Update solutions` or `auto-commit` style messages; keep those consistent.
- PRs should include: a clear summary, linked issues (if any), and screenshots/GIFs for UI changes.

## Security & Configuration Tips

- Configuration lives in repo files and `.env*` is respected by Turbo; do not commit secrets.
- Keep local storage and sync settings changes isolated to `apps/web/hooks/` and `apps/web/components/common/`.
