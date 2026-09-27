# 講義書籍版（PDF）

把 `features/lecture/content/` 的 13 個講義主題排成一本可以送印的書：封面、書名頁、版權頁、前言、目錄、圖目錄、四篇十三章、書末題號索引，外加 180 幅由程式實際執行演算法後畫出的圖解。

## 產生 PDF

在 `apps/web/` 下執行：

```bash
pnpm book:pdf                         # 全書 → book-dist/lc-lecture-book.pdf
pnpm book:pdf --volumes               # 另外按「篇」拆成 4 冊（-vol1.pdf …）
pnpm book:pdf --chapters binary_search,graph --out book-dist/preview.pdf  # 只排幾章預覽
pnpm book:figures                     # 所有圖解排在同一個 HTML 頁面上檢查
```

需要 Chromium。預設使用 Playwright 管理的 Chromium（`$PLAYWRIGHT_BROWSERS_PATH`，雲端環境為 `/opt/pw-browsers`）；也可以用 `--chrome <path>` 或 `$CHROME_PATH` 指定。全書約 2,330 頁；排版會重複到頁碼收斂（通常 3 遍），約 25 分鐘。

字型全部來自 `@fontsource`（Noto Serif TC 內文、Noto Sans TC 標題、JetBrains Mono 程式碼），會完整嵌入 PDF，不依賴系統字型。

## 排版流程

1. `buildLectureBook.ts` 依 `config.ts` 的篇章順序走訪講義樹。每一小節的 Markdown 用與網站相同的 marked + KaTeX + highlight.js 轉成 HTML（`markdown.ts`），`:::example` 轉成範例框，骨架標題（`## 核心想法與直覺` 等）轉成不進書籤的樣式標題。
2. `figures/` 登記的圖依「主題 + 小節標題」插進對應小節，預設放在「核心想法與直覺」第一段之後。
3. Chromium 以 paged media 列印主文：`@page` 命名頁提供每章的書眉，margin box 提供頁碼。第一遍讀回 PDF 書籤得到每個標題的頁碼；之後在需要的地方插入空白頁，讓每一篇、每一章都從奇數頁（右頁）開始，並把頁碼填進題號索引，重複排版直到頁碼不再變動。
4. 前置頁（羅馬數字頁碼）另外列印，再用 pdf-lib 合併：重建書籤樹、把目錄與圖目錄變成可點擊的內部連結、設定頁碼標籤（i, ii, … / 1, 2, …）與文件資訊。

## 開本與樣式

- 開本 185 × 260 mm（16 開），內側留白 22 mm、外側 17 mm，左右頁對稱。可在 `config.ts` 的 `PAGE` 修改。
- 字級、行距、範例框、表格、程式碼等樣式都在 `book.css`。

## 新增或修改圖解

每幅圖是一個回傳 SVG 字串的函式，登記在 `figures/part*.ts` 的陣列中：

```ts
{ id: "bs-trace", category: "binary_search", section: "1. 基礎", caption: "…", render: bsTrace }
```

- `section` 必須與講義中的小節標題完全相同（含編號）；`""` 代表本章導讀。
- `anchor` 可指定插在哪個骨架標題下；找不到該標題時放在小節第一段之後。
- 圖中的數值請用程式計算（跑一次演算法再畫），不要手寫——這樣講義改了範例也不會對不上。
- 共用的畫圖元件（陣列、指標、樹、圖、網格、區間）在 `figures/svg.ts`；配色在 `C`，每種底色的明度不同，灰階印刷時仍可區分。
- 建置時若某幅圖找不到對應小節，會在終端機印出警告。

## 送印前的檢查清單

- 版權頁的 ISBN、出版社與授權說明需由出版方補上（`buildLectureBook.ts` 的 `frontHtml`）。
- 封面（`cover.ts`）為示意設計，正式出版時可替換成設計師提供的檔案。
- 印刷廠若要求出血或 PDF/X，請在交件前另行轉檔；本工具輸出的是 RGB 的一般 PDF。
