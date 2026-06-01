# lc-parser

將 LeetCode 題單／討論頁面的 HTML 轉換為 Markdown，並整理為講義所需的結構化資料。實作為 TypeScript。

## 檔案說明

- `extract_html2md.ts`：下載 HTML 並以 turndown 轉為 Markdown（解析使用 cheerio，下載使用 axios）。匯出 `convertHtmlToMarkdown`，輸出寫入 `dist/`。
- `process.ts`：透過 OpenAI 相容的 LLM（`ai` SDK）將擷取內容整理為結構化 JSON（章節 `title`／`src`／`summary`／`children`／題目清單）。支援 `HTTP_PROXY` 與 `.env`。
- `smoke_test.ts`：對 `convertHtmlToMarkdown` 的煙霧測試，對應 `pnpm --filter web test`。
- `turndown-plugin-gfm.d.ts`：GFM 外掛的型別宣告。

## 安裝依賴

```bash
cd apps/web
pnpm install
```

## 使用方法

```bash
# 擷取並轉換 HTML 為 Markdown
npx tsx lc-parser/extract_html2md.ts

# 整理為結構化講義資料（需設定 LLM 相關環境變數於 .env）
npx tsx lc-parser/process.ts
```

可用的 package.json 指令：

- `pnpm --filter web parser:extract`：執行 `extract_html2md.ts`。
- `pnpm --filter web parser:process`：執行 `process.ts`。
- `pnpm --filter web test`：執行 `smoke_test.ts`。

## 主要依賴

- `cheerio`：HTML 解析。
- `turndown` 與 `@joplin/turndown-plugin-gfm`：HTML 轉 Markdown（含 GFM 表格等）。
- `axios`：HTTP 下載。
- `ai` 與 `@ai-sdk/openai-compatible`：`process.ts` 的 LLM 呼叫。
- `undici`：`process.ts` 的代理請求。

## 功能流程

1. 從指定 URL 下載 HTML。
2. 解析 HTML 並提取標題與內容。
3. 將內容轉換為 Markdown。
4. 由 `process.ts` 整理為結構化 JSON，供題單與講義使用。
