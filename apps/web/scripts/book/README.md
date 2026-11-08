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

## 難度分冊版（簡單篇／中等篇／困難篇）

```bash
pnpm book:pdf:levels                  # 三冊 + 印刷檔 → book-dist/lc-lecture-{easy,medium,hard}*.pdf
npx tsx scripts/book/buildLectureBook.ts --difficulty --level easy          # 只排上冊（閱讀版）
npx tsx scripts/book/buildLectureBook.ts --difficulty --chapters graph,dynamic_programming  # 預覽
```

- **分冊依據**（`difficulty.ts`）：每個葉節點小節取練習表中有難度分數題目的中位數，`< 1600` 歸上冊「簡單篇」、`1600–2099` 歸中冊「中等篇」、`≥ 2100` 歸下冊「困難篇」。代表題是無評分經典題（爬樓梯、反轉連結串列…）或整節沒有評分題的小節，在 `OVERRIDES` 人工指定；新增這類小節而未指定時建置會直接報錯。各章的「常見面試模式」三冊都收。
- 每冊保留四篇的章節順序，只收屬於該冊的小節（及其上層導讀）；章首有「本主題在三冊中的小節數」色條，章末「本主題的其他小節」列出另外兩冊的對應編號。
- 每冊的前置頁是「本冊導讀」（分冊表、三冊難度分布圖、讀法），書末有附錄 A「C++17 面試速查」、B「複雜度估算與面試答題流程」（`appendices.ts`）、C「面試高頻題對照」（取自 `public/studyplan/interview_sprint.json` 的高優題單）、D「題號索引」。
- 封面在 `volumeCover.ts`：三冊各有主色與一幅由演算法實際計算的主圖（雙指標、BFS 分層、線段樹查詢）。

### 印刷檔（`--print`）

每冊另外輸出：

| 檔案                                 | 內容                                                            |
| ------------------------------------ | --------------------------------------------------------------- |
| `lc-lecture-<冊>.pdf`                | 閱讀版：封面、書籤、可點目錄、頁碼標籤                          |
| `lc-lecture-<冊>-print-interior.pdf` | 送印內頁：不含封面，頁數補到 4 的倍數，設定 TrimBox／BleedBox   |
| `lc-lecture-<冊>-print-cover.pdf`    | 封面展開：封底＋書背＋封面，四邊 3 mm 出血；書背寬依頁數計算    |
| `*-cmyk.pdf`                         | 上兩者的 CMYK 版本（需要 Ghostscript `gs`；找不到時略過並警告） |
| `lc-lecture-<冊>-print-spec.txt`     | 給印刷廠的規格單（尺寸、頁數、書背寬、色彩）                    |

書背寬度 = 張數 × `PRINT.leafThicknessMm` + 膠裝餘量，請依印刷廠提供的紙厚修改 `config.ts` 的 `PRINT`。

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
- 難度分冊版新增的圖在 `figures/part7.ts`（簡單篇原本沒有圖的小節），分冊用的資料圖在 `figures/volume.ts`。
- 共用的畫圖元件（陣列、指標、樹、圖、網格、區間）在 `figures/svg.ts`；配色在 `C`，每種底色的明度不同，灰階印刷時仍可區分。
- 建置時若某幅圖找不到對應小節，會在終端機印出警告。

## 送印前的檢查清單

- 版權頁的 ISBN、出版社與授權說明需由出版方補上（`buildLectureBook.ts` 的 `frontHtml`）。
- 主題版封面（`cover.ts`）為示意設計，正式出版時可替換成設計師提供的檔案。
- 主題版輸出的是 RGB 的一般 PDF；難度分冊版加 `--print` 會另外輸出含出血的封面展開與 CMYK 檔。若印刷廠指定 PDF/X-1a 或特定 ICC 描述檔，請以其設定重新轉檔。
- 封底條碼區與版權頁 ISBN 欄需由出版方補上。
