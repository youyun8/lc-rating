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

**為算法學習者打造的 LeetCode 刷題助手**

一個專為算法新手和進階者設計的 LeetCode 題目瀏覽與學習平臺。通過科學的難度分級、系統化的題單分類和完善的進度跟蹤，幫助你建立紮實的算法基礎，從入門到精通，循序漸進提升解題能力。

## 🎓 為什麼選擇 LeetCode Rating？

### 適合算法新手的理由

- **🎯 精準難度評分** - 基於真實競賽數據的難度評分系統，幫助你準確評估題目難度，避免盲目挑戰過難題目而打擊信心
- **📚 系統化學習路徑** - 集成靈茶山艾府 (0x3F) 精心整理的算法題單，按知識點分類，從基礎到進階循序漸進
- **✅ 進度可視化** - 實時跟蹤做題進度，清晰瞭解每個知識點的掌握情況，讓學習成果一目瞭然
- **🏷️ 智能標籤分類** - 按算法類型快速篩選題目，幫助你專注於特定領域的刷題訓練
- **📊 競賽題目分級** - 通過 Q1-Q4 的分級展示，瞭解不同難度層次的題目特點，為參加競賽做準備

## ✨ 核心功能

- **📊 競賽題目瀏覽**
  - 查看歷屆 LeetCode 週賽/雙週賽題目
  - 按 Q1-Q4 分級展示，瞭解競賽題目難度分佈
  - 幫助新手從簡單的 Q1/Q2 題目入手，逐步提升

- **📚 全題庫檢索**
  - 完整的 LeetCode 題庫視圖
  - 多維度篩選（難度、標籤、是否會員題）
  - 支持排序和快速搜索

- **📖 專題題單系統**
  - **二分查找** - 掌握高效查找算法
  - **滑動窗口** - 解決子數組/子串問題
  - **單調堆疊** - 處理區間極值問題
  - **動態規劃** - 從入門到精通 DP
  - **圖論算法** - 掌握圖的遍歷與應用
  - **貪心算法** - 培養貪心思維
  - **位運算** - 掌握位操作技巧
  - **數據結構** - 熟練運用各類數據結構
  - **字符串算法** - 字符串處理專題
  - **樹和二叉樹** - 樹形結構必備
  - **網格圖** - DFS/BFS 應用場景
  - **數學** - 數學思維訓練

- **🎯 智能難度系統**
  - 基於 zerotrac 的題目難度評分
  - 可視化難度分佈（未知、1000-1200、1200-1400...）
  - 幫助選擇適合自己水平的題目

- **📈 學習進度管理**
  - 本地存儲做題記錄
  - 實時統計完成情況
  - 激勵持續學習

- **🎨 人性化設計**
  - 🌓 深色/淺色主題切換
  - 🌏 中文/英文 LeetCode 鏈接切換
  - 📱 響應式設計，支持移動端

## 💡 使用建議（新手必讀）

1. **從題單入門** - 選擇一個感興趣的專題（如滑動窗口、二分查找），從簡單題目開始
2. **關注難度分級** - 建議新手從 1000-1400 分的題目開始，逐步提升
3. **記錄進度** - 使用進度跟蹤功能，堅持每天刷題，養成習慣
4. **循序漸進** - 不要急於求成，紮實掌握每個知識點後再進階
5. **參考題解** - 善用題目關聯的題解鏈接，學習優秀解法

## 🛠️ 技術棧

- **框架**: [Next.js 16](https://nextjs.org/) + [React 19](https://react.dev/)
- **語言**: [TypeScript](https://www.typescriptlang.org/)
- **樣式**: [Tailwind CSS](https://tailwindcss.com/)
- **UI 組件**: [shadcn/ui](https://ui.shadcn.com/)
- **構建工具**: [Turbo](https://turbo.build/)
- **包管理**: [pnpm](https://pnpm.io/)
- **數據獲取**: [TanStack Query](https://tanstack.com/query/latest)
- **Python 工具**: 題單數據生成工具

## 🚀 快速開始

### 環境要求

- Node.js >= 18
- pnpm >= 10.19.0

### 安裝依賴

```bash
pnpm install
```

### 開發模式

```bash
pnpm dev
```

訪問 [http://localhost:3001](http://localhost:3001) 查看應用。

### 構建生產版本

```bash
pnpm build
```

## 📁 項目結構

```
lc-rating/
├── apps/
│   └── web/                  # 主應用
│       ├── app/              # Next.js App Router
│       ├── components/       # React 組件
│       │   ├── Contest/      # 競賽相關組件
│       │   ├── ProblemSet/   # 題庫相關組件
│       │   ├── StudyPlan/    # 題單相關組件
│       │   └── common/       # 通用組件
│       ├── hooks/            # React Hooks
│       ├── types/            # TypeScript 類型定義
│       ├── utils/            # 工具函數
│       └── public/           # 靜態資源
│           ├── problemset/   # 題庫數據
│           └── studyplan/    # 題單數據
└── packages/                 # 共享包
    ├── eslint-config/        # ESLint 配置
    ├── tailwind-config/      # Tailwind 配置
    ├── typescript-config/    # TypeScript 配置
    └── ui/                   # UI 組件庫
```

## 📄 開源協議

本項目採用 MIT 協議開源。

## 🙏 致謝

- [zerotrac](https://github.com/zerotrac/leetcode_problem_rating) - 題目難度評分數據
- [靈茶山艾府 (0x3F)](https://space.bilibili.com/206214/) - 算法題單內容
- [LeetCode](https://leetcode.cn/) - 題目數據來源
- [支持雲端數據的後端](https://wnykuang.github.io/lc-rating/contest/) - 提供雲端數據支持

## 👥 貢獻者

感謝以下所有貢獻者對本項目的支持：

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

## 📈 Star History

<a href="https://star-history.com/#huxulm/lc-rating&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=huxulm/lc-rating&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=huxulm/lc-rating&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=huxulm/lc-rating&type=Date" />
  </picture>
</a>

---

<p align="center">
  <a href="https://github.com/huxulm/lc-rating/stargazers">
    如果這個項目對你有幫助，歡迎 ⭐️ Star 支持！
  </a>
</p>
