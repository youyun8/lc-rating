export const BASE_PATH = process.env.NEXT_PUBLIC_LC_BASE_PATH ?? "/lc-rating";

export const LC_HOST_ZH = `https://leetcode.cn`;
export const LC_HOST_EN = `https://leetcode.com`;

export const LC_RATING_GLOBAL_SETTING_KEY = "lc-rating-global-settings";
export const LC_RATING_PROGRESS_KEY = "lc-rating-progress";
export const LC_RATING_PROBLEM_NOTES_KEY = "lc-rating-problem-notes";
export const LC_RATING_PROBLEM_SOLUTIONS_KEY = "lc-rating-problem-solutions";
export const LC_RATING_OPTION_KEY = "lc-rating-option";
export const LC_RATING_AUTH_TOKEN_KEY = "lc-rating-auth-token";
export const LC_RATING_LAST_SYNC_AT_KEY = "lc-rating-last-sync-at";
export const LC_RATING_PROBLEMSET_TABLE_KEY =
  "lc-rating-problemset-table-state";
export const STORAGE_VERSION = 1;

const YOUR_BACKEND_URL = "https://lc-rating-backend.youyun8.workers.dev";

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

  return "";
};

export const API_BASE = getApiBase();

export const BILIBILI_0X3F_SPACE = {
  url: "https://space.bilibili.com/206214/",
  title: "靈茶山艾府(0x3F)@Bilibili",
};

/**
 * Keys of study plans/lectures authored in this fork, layered on top of the
 * upstream 靈茶山艾府（0x3F）題單. Split into two groups so overview grids can
 * render three labeled sections in order: 0x3F 題單 -> 學習路線 -> 面試準備.
 */
export const LEARNING_PATH_KEYS: ReadonlySet<string> = new Set([
  "rating_2100",
  "q3_handbook",
  "q4_handbook",
]);

export const INTERVIEW_PREP_KEYS: ReadonlySet<string> = new Set([
  "interview_sprint",
  "technical_interview",
]);

export const CUSTOM_STUDYPLAN_KEYS: ReadonlySet<string> = new Set([
  ...LEARNING_PATH_KEYS,
  ...INTERVIEW_PREP_KEYS,
]);

/**
 * Keys that still have a standalone「講義」page. Only the upstream 0x3F 主題:
 * the self-authored learning paths / interview prep plans folded their 講義
 * prose into their 題單, so they intentionally do not appear here.
 */
export const LECTURE_KEYS = [
  "binary_search",
  "sorting",
  "bitwise_operations",
  "data_structure",
  "dynamic_programming",
  "graph",
  "greedy",
  "grid",
  "math",
  "monotonic_stack",
  "sliding_window",
  "string",
  "trees",
] as const;

export const STUDYPLANS = {
  q3_handbook: "LeetCode 競賽 Q3 手冊",
  q4_handbook: "LeetCode 競賽 Q4 手冊",
  technical_interview: "技術面試準備",
  rating_2100: "進階刷題衝刺（1700→2100 四階段）",
  binary_search: "二分搜尋",
  sorting: "排序",
  bitwise_operations: "位元運算",
  data_structure: "資料結構",
  dynamic_programming: "動態規劃",
  graph: "圖論演算法",
  greedy: "貪心",
  grid: "網格圖",
  interview_sprint: "面試衝刺計畫",
  math: "數學",
  monotonic_stack: "單調堆疊",
  sliding_window: "滑動視窗",
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
      [],
    ),
  },
  tutorials: {
    title: "講義",
    href: `/lecture`,
    children: LECTURE_KEYS.reduce(
      (acc: { title: string; href: string }[], key) => [
        ...acc,
        {
          title: STUDYPLANS[key as keyof typeof STUDYPLANS],
          href: `/lecture/${key}`,
        },
      ],
      [],
    ),
  },
  handbook: { title: "手冊", href: `/handbook` },
  training: { title: "集訓", href: `/training` },
  account: { title: "帳號", href: `/account` },
};
