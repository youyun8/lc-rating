# HTML to Markdown Converter

這個工具用於將 LeetCode 討論頁面的 HTML 轉換為 Markdown 格式。

## 檔案說明

- `extract_html2md.py` - Python 版本（使用 markdownify）
- `extract_html2md.ts` - TypeScript 版本（使用 turndown）

## TypeScript 版本使用方法

### 安裝依賴

```bash
cd apps/web
pnpm install
```

### 運行腳本

```bash
npx tsx lc-parser/extract_html2md.ts
```

## 主要依賴

### Python 版本
- `beautifulsoup4` - HTML 解析
- `markdownify` - HTML 轉 Markdown
- `requests` - HTTP 請求

### TypeScript 版本
- `cheerio` - HTML 解析（類似 BeautifulSoup）
- `turndown` - HTML 轉 Markdown（類似 markdownify）
- `axios` - HTTP 請求（類似 requests）

## 功能對比

兩個版本實現了完全相同的功能：

1. 從指定 URL 下載 HTML 檔案
2. 解析 HTML 並提取標題和內容
3. 將 HTML 轉換為 Markdown 格式
4. 儲存為 `.md` 檔案

## 配置

腳本會處理以下 LeetCode 演算法題單：

- 滑動窗口與雙指標
- 二分演算法
- 單調棧
- 網格圖
- 位元運算
- 圖論演算法
- 動態規劃
- 常用資料結構
- 數學演算法
- 貪心演算法
- 鏈結串列、二元樹與回溯
- 字串
