# web

lc-rating 的主網頁應用，採用 Next.js 16（App Router）並以靜態匯出部署至 GitHub Pages。

## 開發

從 repo 根目錄安裝依賴後，可在此 workspace 執行：

```bash
# 開發模式（http://localhost:3001）
pnpm --filter web dev

# 建置（含 GitHub Pages 的 404 redirect 腳本）
pnpm --filter web build

# 型別檢查與 lint
pnpm --filter web check-types
pnpm --filter web lint
```

## 目錄結構

- `app/`：路由（`contest`、`problemset`、`studyplan`、`lecture`、`search`、`troubleshoot`），共用 `(lc)` 版面。
- `components/`：共用元件（`common`、`ui`、`ui-customized`）。
- `features/`：功能模組（`contest`、`problemset`、`studyplan`、`tutorial`、`learning`、`userData`、`troubleshoot`）。
- `data/`：講義與題單衍生資料（如 `lectureTopicProfiles.data.ts`）。
- `hooks/`、`config/`、`types/`、`utils/`、`lib/`：共用邏輯與設定。
- `public/`：靜態資料（`problemset/`、`studyplan/`、`tutorial/`）。
- `lc-parser/`：HTML→Markdown 解析器（見 `lc-parser/README.md`）。
- `lc-maker/`：上游同步與翻譯腳本（Python，見 `lc-maker/README.md`）。

## 相關文件

- 專案總覽：根目錄 `README.md`
