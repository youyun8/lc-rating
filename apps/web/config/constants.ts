export const BASE_PATH = process.env.NEXT_PUBLIC_LC_BASE_PATH ?? "/lc-rating";

export const LC_HOST_ZH = `https://leetcode.cn`;
export const LC_HOST_EN = `https://leetcode.com`;

export const LC_RATING_GLOBAL_SETTING_KEY = "lc-rating-global-settings";
export const LC_RATING_PROGRESS_KEY = "lc-rating-progress";
export const LC_RATING_OPTION_KEY = "lc-rating-option";
export const LC_RATING_AUTH_TOKEN_KEY = "lc-rating-auth-token";
export const LC_RATING_LAST_SYNC_AT_KEY = "lc-rating-last-sync-at";
export const LC_RATING_PROBLEMSET_TABLE_KEY =
  "lc-rating-problemset-table-state";
export const STORAGE_VERSION = 0;

// ============================================
// Backend Configuration for Cloud Sync
// ============================================
// 
// ⚠️ IMPORTANT: Cloud sync is currently DISABLED for asyncchang's deployment.
// 
// The original backend (kuangwinnie.workers.dev) is used by huxulm's repo.
// To enable your own cloud sync, you need to:
// 1. Deploy your own Cloudflare Worker backend (see /backend/README.md)
// 2. Update YOUR_BACKEND_URL below with your worker URL
// 3. Set up GitHub OAuth App for authentication
//
// Until then, the cloud sync buttons will show a "not configured" message.

const YOUR_BACKEND_URL = "https://lc-rating-backend.asyncchang.workers.dev"; // <-- UPDATE THIS AFTER DEPLOYING BACKEND

// Auto-detect backend based on deployment domain
const getApiBase = () => {
  // Priority 1: Environment variable (for custom deployments)
  if (process.env.NEXT_PUBLIC_API_BASE) {
    return process.env.NEXT_PUBLIC_API_BASE;
  }

  // Priority 2: User's custom backend (if configured above)
  if (YOUR_BACKEND_URL) {
    return YOUR_BACKEND_URL;
  }

  // Cloud sync not configured - return empty string to disable features
  return "";
};

export const API_BASE = getApiBase();

export const BILIBILI_0X3F_SPACE = {
  url: "https://space.bilibili.com/206214/",
  title: "靈茶山艾府(0x3F)@Bilibili",
};

export const STUDYPLANS = {
  binary_search: "二分搜尋",
  bitwise_operations: "位元運算",
  data_structure: "資料結構",
  dynamic_programming: "動態規劃",
  graph: "圖論演算法",
  greedy: "貪心",
  grid: "網格圖",
  math: "數學",
  monotonic_stack: "單調棧",
  sliding_window: "滑動窗口",
  string: "字串",
  trees: "樹和二元樹",
};

export const ROUTERS = {
  contest: { title: "競賽", href: `/contest` },
  problemset: { title: "題庫", href: `/problemset` },
  studyPlans: {
    title: "題單",
    href: `/studyplan`,
    children: Object.entries(STUDYPLANS).reduce(
      (acc: { title: string; href: string }[], [key, title]) => [
        ...acc,
        { title, href: `/studyplan/${key}` },
      ],
      []
    ),
  },
};
