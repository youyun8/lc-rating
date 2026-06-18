# LeetCode Rating

<p align="center">
  <a href="https://github.com/huxulm/lc-rating/stargazers">
    <img src="https://img.shields.io/github/stars/huxulm/lc-rating?style=social" alt="GitHub stars">
  </a>
  <a href="https://github.com/huxulm/lc-rating/network/members">
    <img src="https://img.shields.io/github/forks/huxulm/lc-rating?style=social" alt="GitHub forks">
  </a>
  <a href="https://github.com/huxulm/lc-rating/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/huxulm/lc-rating" alt="License">
  </a>
</p>

LeetCode 刷題與學習輔助工具。提供以競賽分數為基礎的難度分級、依知識點分類的題單、講義筆記，以及做題進度追蹤。本專案為繁體中文化的 fork，資料每週由上游自動同步並翻譯。

## 功能

- **競賽題目瀏覽**：歷屆週賽與雙週賽題目，以 Q1–Q4 分級呈現難度分佈。
- **全題庫檢索**：完整題庫視圖，支援依難度、標籤、會員題等條件篩選、排序與搜尋。
- **專題題單**：整合靈茶山艾府 (0x3F) 題單，涵蓋二分查找、滑動視窗、單調堆疊、動態規劃、圖論、貪心、位元運算、資料結構、字串、樹與二元樹、網格圖、數學等主題。
- **難度評分**：採用 zerotrac 的題目難度評分，並以區間（未知、1000–1200、1200–1400……）視覺化呈現。
- **講義筆記**：依題單主題生成的學習講義，整理模型題、訊號、不變式、推導、套路、陷阱與複雜度，並附 C++ 實作骨架。
- **進度管理**：做題記錄存於瀏覽器本地。
- **介面設定**：深色／淺色主題切換、中文／英文 LeetCode 連結切換、響應式版面。

## 技術棧

- 框架：[Next.js 16](https://nextjs.org/) + [React 19](https://react.dev/)（App Router，靜態匯出）
- 語言：[TypeScript](https://www.typescriptlang.org/)
- 樣式：[Tailwind CSS](https://tailwindcss.com/)
- UI 元件：[shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- 資料查詢：[TanStack Query](https://tanstack.com/query/latest) 與 [TanStack Table](https://tanstack.com/table/latest)
- 狀態管理：[Zustand](https://zustand.docs.pmnd.rs/)
- Markdown／數學：marked、KaTeX、highlight.js
- Monorepo 工具：[Turbo](https://turbo.build/) + [pnpm](https://pnpm.io/) workspace
- 資料工具：Python 腳本（上游同步與翻譯）與 TypeScript 解析器

## 環境需求

- Node.js >= 20.9.0
- pnpm >= 10.19.0

## 快速開始

```bash
# 安裝依賴
pnpm install

# 開發模式（網頁應用執行於 http://localhost:3001）
pnpm dev

# 建置生產版本
pnpm build
```

常用指令：

- `pnpm lint`：執行 ESLint。
- `pnpm check-types`：型別檢查（先做 Next typegen 再 `tsc --noEmit`）。
- `pnpm format`：以 Prettier 格式化 `*.ts`、`*.tsx`、`*.md`。

## 專案結構

```
lc-rating/
├── apps/
│   └── web/                  # 主網頁應用（Next.js App Router）
│       ├── app/              # 路由（contest / problemset / studyplan / lecture / search / troubleshoot）
│       ├── components/       # 共用元件（common、ui、ui-customized）
│       ├── features/         # 功能模組（contest、problemset、studyplan、tutorial、learning…）
│       ├── data/             # 講義與題單衍生資料
│       ├── hooks/            # React Hooks
│       ├── config/           # 設定與常數
│       ├── types/、utils/、lib/
│       ├── lc-parser/        # HTML 轉 Markdown 解析器（TypeScript）
│       ├── lc-maker/         # 上游同步與翻譯腳本（Python）
│       └── public/           # 靜態資料（problemset / studyplan / tutorial）
├── scripts/                  # 題單生成與更新腳本（Python）
└── packages/                 # 共用設定與套件
    ├── eslint-config/
    ├── tailwind-config/
    ├── typescript-config/
    └── ui/
```

## 資料更新

題庫與題單資料由 GitHub Actions 自動維護：

- `upstream_data_sync.yml`：同步上游 problemset 資料並翻譯為繁體中文。
- `studyplan_updater.yml`：合併上游題單的新增題目。
- `workflow.yml`：建置並部署至 GitHub Pages。

## 開源協議

本專案採用 MIT 協議開源。

## 致謝

- [zerotrac](https://github.com/zerotrac/leetcode_problem_rating) — 題目難度評分資料
- [靈茶山艾府 (0x3F)](https://space.bilibili.com/206214/) — 演算法題單內容
- [huxulm/lc-rating](https://github.com/huxulm/lc-rating) — 上游專案
- [LeetCode](https://leetcode.cn/) — 題目資料來源

## 貢獻者

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/huxulm">
        <img src="https://github.com/huxulm.png" width="80px;" alt="huxulm"/>
        <br />
        <sub><b>Huxulm</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Autumnal-Joy">
        <img src="https://github.com/Autumnal-Joy.png" width="80px;" alt="AutJ"/>
        <br />
        <sub><b>Autumnal-Joy</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Yorafa">
        <img src="https://github.com/Yorafa.png" width="80px;" alt="Yorafa"/>
        <br />
        <sub><b>Tianle Wang</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/wnykuang">
        <img src="https://github.com/wnykuang.png" width="80px;" alt="wnykuang"/>
        <br />
        <sub><b>Wenyi Kuang</b></sub>
      </a>
    </td>
    <td align="center">
      <img src="https://github.com/github.png" width="80px;" alt="Kefei Qian"/>
      <br />
      <sub><b>Kefei Qian</b></sub>
    </td>
  </tr>
</table>

## Star History

<a href="https://star-history.com/#huxulm/lc-rating&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=huxulm/lc-rating&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=huxulm/lc-rating&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=huxulm/lc-rating&type=Date" />
  </picture>
</a>
