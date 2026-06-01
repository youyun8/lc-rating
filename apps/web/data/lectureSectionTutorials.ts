import { STUDYPLANS } from "@/config/constants";
import { getGoogleInterviewSectionTutorial } from "@/data/googleInterviewSectionTutorials";
import {
  findLectureTopicProfile,
  formatLectureTopicTitle,
  getDefaultLectureExample,
  hasExampleLectureProfile,
  mergeExampleProfile,
} from "@/data/lectureTopicProfiles";
import type { LectureTopicProfile } from "@/data/lectureTopicProfiles";
import { lectureProfileExtras } from "@/data/lectureProfileExtras";
import problemMapJson from "@/public/problemset/problems.json";
import type { ProblemMap, StudyPlanData, TutorialData } from "@/types";
import { sectionAnchor } from "@/utils/sectionAnchor";
import { studyPlanDataMap } from "@/utils/studyPlanIndex";
import { tutorialDataMap } from "@/utils/tutorialIndex";

const EXAMPLE_MIN_RATING = 1900;
const problemMap = problemMapJson as ProblemMap;
const problemBySlug = new Map(
  Object.values(problemMap).map((problem) => [problem.titleSlug, problem]),
);

interface LectureSectionNavItem {
  id: number;
  title: string;
  slug: string;
  depth: number;
}

interface LectureSectionChildItem extends LectureSectionNavItem {
  summary?: string;
  childCount: number;
  totalSections: number;
  practiceProblemCount: number;
  practiceProblemIds: string[];
}

export interface LectureSectionTutorial {
  id: number;
  title: string;
  slug: string;
  planKey: string;
  planTitle: string;
  pathTitles: string[];
  content: string;
  practiceProblems: StudyPlanData.Item[];
  navItems: LectureSectionNavItem[];
  children: LectureSectionChildItem[];
  previous?: LectureSectionNavItem;
  next?: LectureSectionNavItem;
}

interface IndexedTutorialSection extends LectureSectionNavItem {
  section: TutorialData.Section;
  pathTitles: string[];
}

function flattenTutorialSections(
  sections: TutorialData.Section[] | undefined,
  pathTitles: string[] = [],
  depth = 0,
): IndexedTutorialSection[] {
  if (!sections) return [];

  return sections.flatMap((section) => {
    const item: IndexedTutorialSection = {
      id: section.id,
      title: section.title,
      slug: sectionAnchor(section.title),
      depth,
      section,
      pathTitles: [...pathTitles, section.title],
    };
    return [
      item,
      ...flattenTutorialSections(
        section.children,
        [...pathTitles, section.title],
        depth + 1,
      ),
    ];
  });
}

function countTutorialSections(section: TutorialData.Section): number {
  return (
    1 +
    (section.children ?? []).reduce(
      (sum, child) => sum + countTutorialSections(child),
      0,
    )
  );
}

function findStudyPlanSectionById(
  sections: StudyPlanData.Section[] | undefined,
  id: number,
): StudyPlanData.Section | undefined {
  if (!sections) return undefined;

  for (const section of sections) {
    if (section.id === id) return section;
    const child = findStudyPlanSectionById(section.children, id);
    if (child) return child;
  }

  return undefined;
}

function flattenProblems(
  section: StudyPlanData.Section | undefined,
): StudyPlanData.Item[] {
  if (!section) return [];
  return [
    ...(section.problems ?? []),
    ...(section.children ?? []).flatMap(flattenProblems),
  ];
}

function getProblemIds(problems: StudyPlanData.Item[]) {
  return Array.from(
    new Set(
      problems
        .map((problem) => problem.id?.toString())
        .filter((id): id is string => Boolean(id)),
    ),
  );
}

function getProblemRating(problem: StudyPlanData.Item | undefined) {
  if (!problem) return undefined;
  if (typeof problem.score === "number") return problem.score;

  const problem_id = problem.id?.toString();
  const indexed_by_id = problem_id ? problemMap[problem_id] : undefined;
  return indexed_by_id?.rating ?? problemBySlug.get(problem.slug)?.rating;
}

function getProblemDisplayId(problem: StudyPlanData.Item | undefined) {
  if (!problem) return undefined;
  return problem.id?.toString();
}

function getProblemDisplayTitle(problem: StudyPlanData.Item) {
  const problem_id = getProblemDisplayId(problem);
  if (!problem_id) return problem.title;
  const escaped_id = problem_id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return problem.title.replace(new RegExp(`^${escaped_id}\\.?\\s*`), "");
}

function pickExampleProblem(
  section: StudyPlanData.Section | undefined,
): StudyPlanData.Item | undefined {
  const problems = flattenProblems(section);
  if (problems.length === 0) return undefined;

  const high = problems
    .filter((problem) => (getProblemRating(problem) ?? 0) >= EXAMPLE_MIN_RATING)
    .sort((a, b) => (getProblemRating(a) ?? 0) - (getProblemRating(b) ?? 0));
  if (high.length > 0) return high[0];

  return problems
    .slice()
    .sort(
      (a, b) =>
        (getProblemRating(b) ?? Number.NEGATIVE_INFINITY) -
        (getProblemRating(a) ?? Number.NEGATIVE_INFINITY),
    )[0];
}

function formatList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function formatSteps(items: string[]) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

const lectureConceptGuides: Record<string, string[]> = {
  "binary-lower-bound": [
    "二分搜尋的本質不在於「切一半」，而是找出 false 與 true 之間的分界線。陣列已排序時，分界線是某個值首次出現的位置；答案具單調性時，分界線即是第一個或最後一個可行答案。",
    "下手前先區分兩種題型：搜尋下標 predicate 為 `nums[mid] >= target`；搜尋答案值 predicate 為 `can(mid)`。predicate 的真假必須單調排列，否則二分沒有立足之地。",
    "採用半開區間 `[left, right)` 的好處是迴圈結束時 `left == right`，答案自然落在同一變數。每次更新邊界都應能說明被丟棄的那半為何不可能含有答案。",
    "同一套逐位逼近的思想可延伸到更進階的題型：序列或樹上的「向上跳」用倍增（binary lifting），答案對某參數呈凸性且要求「恰好選 k 個」時用 wqs 二分（帶權二分），求最優比值的題型則對應 0/1 分數規劃。C++ 的 `lower_bound` 與 `upper_bound` 已封裝好下標二分。",
  ],
  "kth-smallest": [
    "第 K 小題的難點在於候選集過大，無法全部列出再排序。常見策略有兩類：只要第 K 小的值就用二分答案配合計數；要依序產生前 K 個候選則用 heap 維護可見邊界。",
    "建模時先問候選集能否切成多條有序鏈。例如矩陣每列有序、pair sum 對其中一個下標單調，這些情境下 heap 只需保存每條鏈的下一個候選，不必展開整個笛卡兒積。",
    "二分答案的關鍵是設計 `count(x)`：候選值 `<= x` 的數量。`count(x) >= k` 表示答案不大於 x，反之則更大。計數通常遠比列出候選便宜。",
    "需反覆查詢「某區間第 k 小」時，可改用權值樹狀數組、主席樹（可持久化線段樹）或整體二分；只取單一第 k 小的數值而不需排序時，C++ 的 `nth_element` 平均 `O(n)` 即可。",
  ],
  "binary-answer": [
    "二分答案處理「最小化最大值」或「最大化最小值」這類最佳化。固定一個候選答案後，原題化為判斷題：此上限是否足夠？此下限是否可達？",
    "下筆前先用一句話定義 `can(x)`，並判斷 true 的方向。容量越大越易運完貨、速度越快越易準時吃完、距離越大越難放更多點──方向判斷錯，二分邊界必錯。",
    "check 函式只回答可不可行，不順帶求最優。如此分工才清楚：二分負責找邊界，check 負責維護單調性。",
    "判定函式 `can(x)` 在值域上呈階梯狀（單調），這正是能二分的條件；值域為浮點數時，改用固定迭代次數（例如 100 次）取代 `eps` 比較，避免精度造成的死迴圈。",
  ],
  "prefix-sum": [
    "前綴和把連續區間改寫為兩個前綴狀態之差。要建立的核心轉換是：不要重新加總 `[left, right]`，而是用 `prefix[right] - prefix[left]` 取得。",
    "題目問子陣列數量時，掃到右端點不必回頭枚舉所有左端點。只需知道過去出現過哪些前綴狀態與各自次數，就能一次算出以當前位置結尾的合法區間數。",
    "前綴狀態不限於 sum。同餘問題用 `sum % k`，字母奇偶用 bitmask；關鍵是子區間性質能否由「當前狀態」與「歷史狀態」合成。",
    "前綴思想可推廣到二維（前綴和矩陣以容斥查子矩形）與樹上（樹上前綴和、樹上差分配合 LCA）；最大子段和的 Kadane 也是前綴最小值的應用。含負數時不可改用滑動視窗。",
  ],
  "enumerate-maintain": [
    "列舉維護的核心是固定一個角色，讓其餘資訊化為已知歷史。暴力枚舉 pair 或 triple 時，往往有一層可改寫成「掃描中累積的最佳值、最小值、計數表或集合」。",
    "下手前先決定掃描順序。枚舉右端點時，左側資料結構僅含其前的元素；枚舉中間點時，左右兩側需分開維護。加入元素的時機直接影響是否會把自己配到自己。",
    "正確性來自不漏不重：每個答案組合都在某個固定位置被計算一次，且資料結構此刻保留的候選恰好是可與之配對的那一側。",
    "三元組題常以「枚舉中間元素」拆成左右兩側各自維護；維護的摘要可以是最大／最小值、計數表、雜湊表或有序集合，視查詢需求而定。",
  ],
  "rating-2100-data-structure": [
    "Rating 2100 的資料結構題不只是問某個容器怎麼用，而是要把題目拆成事件、候選集合與查詢。動手選 Fenwick 或 segment tree 之前，先寫清楚每次操作到底要查什麼：前綴數量、區間最大值、前驅後繼、過期最大值，還是連通性。",
    "此難度常見的轉換是「排序後讓某個條件單調」。門檻一旦單調，資料便能一批批加入，查詢時結構中恰好保存當下合法的候選。離線排序、掃描線與 DSU 門檻查詢都建立在這個基礎之上。",
    "挑選資料結構時也要看更新方向：只加不刪用 Fenwick 或 DSU；需要刪除過期候選用 heap lazy deletion 或 set；需要區間合併資訊才考慮 segment tree。",
    "更進階的離線技巧包括線段樹分治（處理隨時間加入或刪除的元素）、CDQ 分治（處理多維偏序）與整體二分；掃描線則把二維區間問題降為一維的事件序列。",
  ],
  "difference-array": [
    "差分陣列是前綴和的反向操作。原陣列記錄每個位置的值，差分陣列記錄的是相鄰位置間的變化。對整段加同一個值，只會影響區間起點與終點後一格兩處。",
    "它適合大量區間更新、最後才一次讀答案的情境。每次對 `[l, r]` 加 delta 時，在 `diff[l]` 加 delta、`diff[r+1]` 減 delta；最終做一次前綴和即可把更新疊回每個位置。",
    "差分不適合更新與查詢交錯的題，因為它把結果延後到最後才還原。若每次更新後都要即時查區間和或最大值，應改用 Fenwick 或 segment tree。",
    "差分同樣有二維版本（差分矩陣）與樹上版本（點差分、邊差分配合 LCA），用於把大量「子矩形加值」或「路徑加值」延後到最後一次還原。",
  ],
  fenwick: [
    "Fenwick tree 可視為一組負責不同長度區間的小桶。位置 `i` 的桶長度由 `lowbit(i)` 決定；更新單點要更新所有包含它的桶，查前綴和則沿桶往前跳。",
    "它解決的是「資料會變動，但仍要快速查詢前綴資訊」的問題。普通前綴和查得快但更新慢；Fenwick 把單點更新與前綴查詢都壓到 `O(log n)`。",
    "常見錯誤是 0-index 與 1-index 混用。Fenwick 內部使用 1-index，因為 `index += index & -index` 與 `index -= index & -index` 都要求 index 不為 0。",
    "樹狀數組可延伸出「區間更新 + 區間查詢」（維護兩個 BIT）、二維樹狀數組，以及在其上做倍增以求第 k 小；求逆序對是其經典應用。需要區間合併或區間最值時改用線段樹。",
  ],
  dsu: [
    "並查集維護的是「哪些元素目前屬於同一集合」。它不記錄路徑長度也不記錄具體路徑，只回答兩個點是否已透過先前的關係連在一起。",
    "每個集合有一個代表元：`find(x)` 找出 x 所屬集合的代表，`unite(a, b)` 合併兩個集合。路徑壓縮與按大小合併讓操作均攤接近常數。",
    "它適合邊逐步加入的連通性問題。若題目需要刪邊、查最短路、或回溯連通路徑經過哪些點，普通 DSU 並不足夠。",
    "進階變體包括帶權並查集（維護到代表元的距離或種類關係）、可撤銷並查集（不做路徑壓縮、配合線段樹分治支援刪邊），以及 DSU on tree（啟發式合併）處理子樹統計。",
  ],
  "monotonic-stack": [
    "單調棧保存的是尚未結算的一批元素。新元素破壞單調性時，被彈出的元素就找到了自己的右側邊界，例如下一個更大值、下一個更小值或貢獻範圍。",
    "它的目的不是排序，而是讓每個元素只被處理常數次。暴力向右找第一個更大元素會重複掃描；單調棧把待解元素集中保留，待答案出現時一次結算。",
    "處理子陣列極值貢獻時，棧內通常存 index 而非 value，因為答案需要左右距離。相等元素須明定由左或右負責，否則會重複計數。",
    "貢獻法的標準公式為：某元素作為區間最小值的子陣列數 =（到左側第一個更小元素的距離）×（到右側第一個更小元素的距離），相等元素一側取嚴格、一側取非嚴格以避免重複。直方圖最大矩形與接雨水皆為其應用；單調隊列則把同一思想用於滑動窗口最值與 DP 轉移優化。",
  ],
  "sliding-window": [
    "滑動視窗處理連續區間：右端點負責加入、左端點負責移除，全程只向前推進，不回頭枚舉所有區間。",
    "前提是窗口狀態可以局部更新，且合法性對窗口長短具有可控方向。最多 K 種、最多 K 個 0、總和不超過某值等條件，通常能藉左端右移恢復合法。",
    "計數題要留意貢獻方式：固定右端點時，有題加上窗口長度，有題在合法後加上之後所有右端點數量。先寫清「固定一端時有多少選擇」再動手寫程式。",
    "「恰好 K」的計數常拆成「至多 K」減「至多 K-1」，兩個至多型窗口各自單調、各跑一次線性掃描；窗口需要任意刪除或查中位數時，改用 `multiset` 或對頂堆。",
  ],
  knapsack: [
    "背包 DP 的核心是資源容量。每件物品消耗重量、成本或名額，帶來價值、方案數或可行性。狀態 `dp[cap]` 表示容量 cap 下已處理物品所能達到的結果。",
    "0-1 背包與完全背包的差別不在公式外觀，而在同一物品是否可重複使用。0-1 背包容量倒序以避免同輪重取，完全背包容量正序以允許重複使用。",
    "下筆前先判斷答案型態──最大值、最小值、可不可行或方案數，初始化各不相同：方案數通常 `dp[0]=1`，最小化則初始為無限大。",
    "多重背包可用二進位拆分或單調隊列優化；分組背包每組至多選一；樹上背包以子樹大小為界做 `O(n^2)` 合併；僅判可行性時可用 `bitset` 把轉移壓到 `O(nW/64)`。",
  ],
  "grid-dp": [
    "網格 DP 把每個格子視為一個狀態。若移動方向僅向右、向下，或依值大小構成 DAG，填表順序即可保證轉移來源已算好。",
    "下手前先確認圖是否有環。只往右下走的路徑計數適用 DP；可任意四向移動的最短路屬於 BFS 或 Dijkstra，不能用普通填表。",
    "邊界條件是網格 DP 的本體而非附屬。第一列、第一行、障礙格與起點初始化若語意不清，公式再對也會算錯。",
    "需要壓縮整列邊界狀態的題型（例如鋪磚、互不相鄰選格），用輪廓線 DP 或插頭 DP 把一整列的邊界資訊壓成 bitmask 再轉移。",
  ],
  "grid-state-bfs": [
    "網格題可視為一張未明寫邊的圖：格子為節點，四向或八向為邊。每步成本相同時，BFS 保證首次抵達某個完整狀態即為最短距離。",
    "關鍵在於「完整狀態」不只是座標。同一格若剩餘消除次數、鑰匙集合、方向或時間不同，未來可走的路便不同，visited 或 dist 必須納入這些資訊。",
    "狀態維度擴展後先估狀態數：`rows * cols * k` 可接受用 BFS；邊權不等改用 0-1 BFS 或 Dijkstra；k 大到必然可直走時可先用限制推導剪枝。",
    "邊權只有 0 與 1 時用 deque 的 0-1 BFS（0 權放前、1 權放後）；起點不唯一時用多源 BFS，把所有起點距離設 0 一起入隊。",
  ],
  "dp-linear": [
    "線性 DP 處理序列上的逐步決策。常見問題是處理到第 i 個元素時：要不要選它、接在哪個前一狀態之後、最後一段從哪裡切開。",
    "設計狀態時切勿把 `dp[i]` 寫成模糊的「目前答案」，必須說清楚它是前 i 個元素的最佳值、以 i 結尾的最佳值，或處理到 i 並處於某種狀態下的答案。",
    "轉移通常源自最後一步。先問最後一次操作是什麼，再回頭找它依賴哪些較小狀態。如此可把暴力搜尋整理為有向的表格。",
    "狀態設計的試金石是無後效性：僅憑狀態即可決定未來，與抵達的路徑無關。最長遞增子序列可用「二分 + 維護最小結尾」做到 `O(n log n)`；含「持有／未持有」等情形屬於狀態機 DP；只依賴前幾項時可用滾動陣列省空間。",
  ],
  "rating-2100-dp": [
    "Rating 2100 的 DP 題往往不只是一維陣列：序列、限制次數、集合、圖或排序條件會交織在一起，先找出「未來還需要知道哪些資訊」，這些資訊才是狀態維度。",
    "設計時先寫暴力搜尋的函式參數，再檢視哪些參數會重複出現。同組參數對應的未來相同便可 memo；轉成迭代時，計算順序必須保證依賴狀態已算好。",
    "優化 DP 不必硬背名字。先保留樸素轉移 `dp[i] = max(dp[j] + value)`，再觀察 j 的合法範圍是否為前綴、窗口、排序前驅或一條線──資料結構僅是用來快速找最佳 j 的工具。",
    "常見變體包括區間 DP（環形題複製一倍）、狀態壓縮 DP 與子集和 SOS DP、數位 DP（逐位 + 上界限制 + 前導零）；轉移含 `min(m*x+b)` 形式時用斜率優化或李超線段樹，固定窗口最值用單調隊列，線性遞推可用矩陣快速冪加速。",
  ],
  "graph-bfs-dfs": [
    "圖搜尋的第一步是定義節點與邊。節點未必是題目明說的城市或人，也可能是網格座標、字串狀態、已持鑰匙集合或剩餘資源。",
    "DFS 適合走完一個連通塊、進行遞迴回溯或合併子樹資訊；BFS 適合每條邊代價相同的最短步數，因為首次抵達某狀態時距離最短。",
    "visited 的維度必須與狀態一致。若同一格因鑰匙集合或剩餘消除次數不同而影響未來，就應視為不同狀態，不能只用座標去重。",
    "許多非圖題其實是隱式圖：改一個字元、倒一次水、走一步棋都可當作一條邊。延伸主題包括割點與橋、邊雙／點雙連通分量、歐拉路，以及用 DFS 序把子樹映成連續區間。",
  ],
  "topological-dp": [
    "拓撲排序處理有向依賴：某件事必須在另一件事之前完成。入度為 0 代表沒有未完成的前置條件，可以先處理。",
    "圖中若有環，便不存在合法的線性處理順序。這也是拓撲排序既能排程，又能檢查依賴是否矛盾的原因。",
    "DAG 上 DP 的關鍵是順序。當節點依拓撲順序被處理時，所有前驅皆已將資訊傳入，方可安全地更新最早完成時間、最長路或方案數。",
    "Kahn（入度 BFS）與 DFS 後序都可得拓撲序；要求字典序最小時把佇列換成 priority queue。差分約束系統也透過最短或最長路求解，存在負環即代表無解。",
  ],
  dijkstra: [
    "Dijkstra 處理非負邊權最短路。每次從 priority queue 取出當前距離最小的狀態；在非負權前提下，該狀態之後不可能再被更短路徑改善。",
    "鬆弛是最短路的基本動作：若經當前節點能讓鄰居距離變小，就更新鄰居並放回候選集合。queue 中可能殘留舊距離，取出時要檢查是否仍與最新距離相等。",
    "若題目涉及折扣、剩餘次數、方向或時間，狀態須擴展為 `(node, extra_state)`；僅用 node 作為距離鍵會把未來能力不同的情況混為一談。",
    "邊權可能為負時改用 Bellman-Ford 或 SPFA，並可偵測負環；需要次短路時每個節點保留最短與嚴格次短兩個距離；對終點在反圖跑一次 Dijkstra 可得所有點到終點的距離；k 短路可用 A*。",
  ],
  mst: [
    "最小生成樹是在無向圖中選出連通所有點的 `n-1` 條邊，使總權重最小。它不是最短路：MST 關心整張網路的建設成本，不關心兩點之間的路徑長度。",
    "Kruskal 從最便宜的邊開始考慮：若邊連接兩個不同連通塊，加入它可使森林更連通；若兩端已連通，加入只會形成 cycle，無需保留。",
    "正確性源自 cut property：跨越某切分的最小邊必存在於某棵 MST 中。DSU 則負責快速判斷該邊是否跨越兩個不同 component。",
    "MST 同時是最小瓶頸生成樹（最小化路徑上的最大邊）；其變體有次小生成樹與 Boruvka 演算法。Kruskal 重構樹可把「兩點間路徑的最大邊」轉成樹上 LCA 查詢。",
  ],
  "low-link": [
    "low-link 題先把 DFS 樹與原圖中的回邊分開看。`dfn[u]` 是節點首次被看到的時間，`low[u]` 是 u 或其子樹所能回到的最早祖先時間。",
    "無向圖中，若 child 子樹沒有任何回邊能回到 parent 或更早祖先，parent-child 這條 tree edge 即是橋；移除它會使 child 子樹與外界斷開。",
    "有向圖的 SCC 則以 low 值判斷一批節點是否仍在同一互相可達區域。學此類題時先畫 DFS tree、標出 back edge，比硬背 Tarjan 模板穩定得多。",
    "割點與橋的判定略有差異：非根節點 u 為割點需 `low[child] >= dfn[u]`，根節點則需有兩個以上 DFS 子樹；橋的條件是 `low[child] > dfn[u]`。縮點後，邊雙、點雙與 SCC 都會化為樹或 DAG；2-SAT 也透過 SCC 求解。",
  ],
  "network-flow": [
    "網路流把問題視為從 source 往 sink 輸送某種資源，每條邊有容量上限。流量守恆意味著中間節點不能憑空產生或消失流量。",
    "殘量圖是最大流的核心：每送出一單位流量，便在反向邊留下可撤銷的容量，使日後若發現更好的安排能將先前流量退回重分配。",
    "許多匹配、最小割與選不選限制題都可建成流圖。建模時要決定每個限制應化為節點容量、邊容量，或 source/sink 兩側的連接。",
    "最大流常用 Dinic；最大流最小割定理保證最小割等於最大流；帶費用時用費用流（SPFA 或加勢的 Dijkstra 找增廣）；有上下界時轉成可行流模型。二分圖最大匹配等價於單位容量的最大流，並有 König 定理：最小點覆蓋 = 最大匹配。",
  ],
  "greedy-interval": [
    "區間貪心的第一步是決定排序鍵。若目標是選最多不重疊區間，按右端點排序最合理，因為越早結束越能留下更多後續空間。",
    "貪心不能停留在「看起來最好」，必須能用交換論證：任一最優解若首選不是最早結束的區間，把它替換為最早結束區間後，後續可選空間不會變差。",
    "區間題要先釐清端點語意。閉區間、半開區間、是否允許端點相接，直接決定判斷式使用 `>` 還是 `>=`。",
    "排序鍵依目標而異：選最多不重疊區間與用最少點覆蓋所有區間都按右端排序，而合併區間或求最大重疊數則常按左端排序。",
  ],
  "math-number-theory": [
    "數論題的第一步通常是把題目文字翻成整除、餘數、質因數或 gcd。這類表示能揭露原本看不見的結構，例如兩數可交換正是因為共享質因數。",
    "質因數分解把乘法問題拆成各 prime 的指數問題；gcd 把共同因子壓成一個值；同餘把無限整數壓到有限餘數類。三者皆是縮小狀態的手段。",
    "務必留意整數溢位與模除法。`lcm(a, b)` 應先除以 gcd 再乘；模數下做除法只有除數可逆才能改用乘逆元。",
    "常備工具包括線性篩與積性函數、擴展歐幾里得與線性求逆元、CRT、Lucas 定理（大組合數取模）與莫比烏斯反演；矩陣快速冪可加速線性遞推，FFT／NTT 處理卷積，博弈題則用 SG 函數。",
  ],
  kmp: [
    "KMP 解決的是固定 pattern 在 text 中匹配時的重複比較。暴力失配後會把 pattern 重新對齊，KMP 則利用 pattern 自身的前後綴重疊資訊保留仍可能匹配的部分。",
    "`pi[i]` 是 `pattern[0..i]` 的最長相等真前後綴長度。失配時這個值告訴我們 pattern 該退到哪裡，免於重比已知相等的字元。",
    "KMP 的本質不是字串魔法，而是狀態回退。`matched` 表示目前匹配了多少 pattern 前綴；每次失配都沿 border 鏈回到下一個可能狀態。",
    "字串最小週期長度為 `n - pi[n-1]`，若整除 n 則整串由該週期重複構成；Z 函數提供每個後綴與整串前綴的 LCP；多模式匹配時把 KMP 推廣為 AC 自動機（在 Trie 上建失配邊）。",
  ],
  "tree-linked-binary": [
    "鏈表與樹同屬指標結構。鏈表修改前須先保存下一個節點，否則斷鏈後就丟失後半段；樹遞迴前必先定義每次 DFS 呼叫要回傳什麼資訊。",
    "二元樹題常分為自頂向下與自底向上：自頂向下把祖先資訊傳給孩子，自底向上先處理左右子樹再把高度、路徑和、是否平衡等資訊回傳給父節點。",
    "路徑題要分清「可向父節點延伸的單邊路徑」與「僅在當前子樹內完成的完整答案」。許多全域答案是在回溯時由左右子樹合併更新而來。",
    "鏈表常用虛擬頭節點與快慢指標（找環、找中點）。樹的進階工具包括求直徑（兩次 BFS 或樹形 DP）、重心、LCA（倍增）、樹鏈剖分與點分治；子樹統計可用 DFS 序加資料結構。",
  ],
  "bitwise-contribution": [
    "位元題的優勢在於每個 bit 通常可獨立討論。對 XOR、OR、AND 這類運算，先判斷單一 bit 在何情況下變成 1，再把每位的貢獻乘回權重。",
    "XOR 某位為 1，代表該位上 1 的數量為奇數，或兩數在該位相異；OR 某位為 1，只要至少一個候選提供該位；AND 則要求所有相關元素皆提供該位。",
    "高位貪心通常自高往低試填，因為高位價值大於所有低位總和。只要能檢查當前高位前綴是否可行，便能逐步固定答案。",
    "枚舉一個遮罩的所有子集可用 `for (int s = m; s; s = (s - 1) & m)`，所有遮罩合計 `O(3^n)`；`bitset` 能把布林轉移壓到 `O(n^2/64)`；按位獨立的計數常與前綴和或 SOS DP 結合。",
  ],
  "linear-basis": [
    "XOR 線性基把整數視為 GF(2) 上的向量。選取子集做 XOR 等同於把若干向量相加，問題即化為這些向量能生成哪些值。",
    "每個 basis 位置保存一個最高位固定的代表向量。插入新數時用既有基向量消去最高位；若最後變成 0，表示它已可由舊向量組合而成，不增加生成能力。",
    "求最大 XOR 時自高位往低位嘗試讓答案變大。若 `answer ^ basis[bit]` 更大就採用，因為高位收益優先於低位。",
    "線性基除了求最大 XOR，還能求第 k 小 XOR、判斷一組數是否線性相關、計算可生成值的個數；維護前綴線性基可支援區間查詢，實數版則用高斯消元。",
  ],
  "greedy-general": [
    "貪心題的重點是證明局部選擇不破壞最優性。僅靠「我覺得先選這個比較好」並不算解法，必須以交換論證、反悔或排序不等式加以說明。",
    "反悔貪心先暫時接受候選，待限制被破壞時再從已接受集合中移除最不值得保留者；heap 的角色即是快速找出該被反悔的元素。",
    "此類題常存在一個逐步擴張的限制，例如時間、資源、前綴和或可到達位置。掃描順序使限制單調變化，heap 或 set 則維護當下仍可保留的候選集合。",
    "貪心的正確性有三條常見路徑：交換論證、反悔（先選再撤回）與擬陣理論。能舉出一個反例即足以否定貪心，此時改用 DP 或搜尋枚舉決策。",
  ],
  manacher: [
    "Manacher 處理的是中心擴展回文時的重複比較。普通中心擴展最壞會反覆掃過同一段字元；Manacher 利用已知最右回文區間的鏡射中心，為新中心提供初始半徑。",
    "它維護的 `[left, right]` 是當前右端最遠的回文。若新中心 i 落入此區間，可先繼承鏡射點已算過的半徑，再僅對未知區域繼續擴展。",
    "學 Manacher 時要固定半徑定義──是包含中心的格數、左右可延伸長度，還是處理後字串的半徑──這會直接影響最終答案的換算。",
    "插入分隔字元（如 `#`）可統一處理奇偶長度的回文；Manacher 求的是以每個位置為中心的最長回文半徑，回文自動機（PAM）則能進一步統計本質不同的回文與其出現次數。",
  ],
  "string-tools": [
    "字串工具的差別在於它們所加速的比較種類不同：KMP 處理固定 pattern 匹配，Z function 處理每個後綴與整串前綴的 LCP，rolling hash 處理任意兩段子字串比較，Trie 處理多字典詞共享前綴。",
    "選工具前先問：昂貴操作是什麼？反覆從某位置與 pattern 比較用 KMP/Z；任意子串相等判斷用 hash 或後綴結構；大量詞的前綴查詢用 Trie。",
    "不必把所有字串題套上同一模板。工具只是讓比較變快，真正的解法仍須看外層是 DP、二分、貪心、圖搜尋或資料結構維護。",
    "更重的工具包括後綴數組（SA）、後綴自動機（SAM）與回文自動機（PAM），處理任意子串排序、本質不同子串計數等；雜湊建議用雙模或 64 位以降低被卡碰撞的風險；另有最小表示法與 Lyndon 分解處理循環同構。",
  ],
  "combinatorics-geometry": [
    "組合計數的目標是讓每個物件被計算一次且僅一次。可分階段獨立完成的選擇用乘法原理；不同計數集合彼此重疊則需容斥或 DP 拆開處理。",
    "放球問題、排列組合、質因數指數分配的本質皆是將一批相同或相異的選擇分配到若干位置。要先判斷物品是否可區分、盒子是否可區分、是否允許空盒，公式才會正確。",
    "幾何題則要先把圖形關係改寫為向量運算：叉積判方向與面積，點積判角度與投影；處理共線、重點與浮點誤差的細節，往往比公式本身更關鍵。",
    "常見計數模型有卡特蘭數（合法括號、二元樹形態）、斯特林數（分組）、隔板法，以及處理對稱去重的 Burnside／Pólya；正面難算時改算補集。幾何常用工具包括凸包、旋轉卡殼（求直徑）、掃描線（矩形面積並、最近點對）與極角排序。",
  ],
  "segment-tree": [
    "線段樹把一段區間遞迴二分，每個節點維護一段區間的聚合值（和、最大、最小或計數）。它解決的是「區間更新與區間查詢同時要快」的問題。",
    "lazy 標記是支援區間更新的關鍵：對被完全覆蓋的區間直接打標記而不立即下推，等到需要進入子節點時才 push down，藉此把每次操作壓在 `O(log n)`。",
    "LeetCode 上的典型用法是區間加配區間和、區間賦值配區間最大，以及值域上的權值線段樹（求第 k 小或計數）；值域很大時用動態開點取代離散化。",
  ],
  "two-pointers": [
    "相向雙指標在已排序的陣列上，用左右兩指標從兩端向中間移動，依當前組合與目標的大小關係決定移動哪一端，在線性時間內找出配對或極值。",
    "它與滑動視窗的差別在於方向：滑動視窗兩指標同向前進維護一段區間，相向雙指標兩端對撞縮小範圍。三數之和、盛最多水、接雨水都是典型。",
    "正確性來自單調性：移動一端後被排除的元素不會再成為更好的答案。前提是陣列有序或排序後不影響答案；含重複值時需跳過相同元素去重。",
  ],
  "interval-dp": [
    "區間 DP 的狀態是 `dp[i][j]`，表示連續區間 `[i, j]` 的答案，並由更短的子區間合併而成。",
    "轉移的關鍵是「最後一步」：枚舉區間內最後合併的分割點，或最後被處理（戳破、移除）的元素，把區間拆成兩段獨立子問題。",
    "填表須按區間長度由小到大，確保子區間先算好。常見題型有最長回文子序列、戳氣球與合併石子。",
  ],
  "tree-dp": [
    "樹形 DP 在一棵樹上以後序 DFS 把子樹資訊合併成父節點的答案；處理父節點前，其所有孩子的狀態都已算好。",
    "節點狀態常是「選或不選此節點」或「以此節點為端點的最長鏈」；全域答案在根或回溯途中更新（如樹的直徑為每點左右最長鏈之和）。",
    "需要每個節點都得到「以它為根」的答案時，用換根 DP：第一次 DFS 算子樹資訊，第二次 DFS 把父側資訊下推給孩子。",
  ],
  "digit-dp": [
    "數位 DP 統計某範圍內滿足數位條件的整數個數，逐位從高到低填數字，沿途記錄是否仍貼著上界（tight）與題目所需狀態。",
    "`tight` 為真時當前位的上限受 n 限制；為假時子問題與具體上界無關，可記憶化重用。前導零用 `started` 旗標處理。",
    "區間 `[lo, hi]` 的答案用前綴相減 `f(hi) - f(lo - 1)`，適用於上界極大、無法逐一枚舉的計數題。",
  ],
  "state-compression-dp": [
    "狀態壓縮 DP 用一個整數的二進位位元表示「已選集合」，`dp[mask]` 表示集合 mask 已完成時的最優值，適用於元素數很小（約 `n <= 20`）的題。",
    "轉移在合法的位元變化間進行：加入一個尚未選的元素，或對 mask 枚舉子集。旅行商、任務指派、棋盤鋪放是典型題型。",
    "`2^n` 狀態決定 n 的上限；位元運算要注意優先序（`mask | (1 << j)` 需括號），子集枚舉用 `for (s = mask; s; s = (s - 1) & mask)`。",
  ],
  backtracking: [
    "回溯以 DFS 在決策樹上枚舉所有方案：在每個位置做選擇、遞迴、再撤銷選擇。適合需要列出所有子集、排列、組合或分割的題。",
    "去重的關鍵是控制同一層的選擇：組合型用起始下標避免重複，排列型用 used 標記，含重複元素時先排序再跳過同值分支。",
    "回溯的成本與方案數同階，因此只適用於規模小的題；若只需計數或最優值，通常改用 DP。",
  ],
};

function buildConceptPrimer(topic: string, profile: LectureTopicProfile) {
  const concept_guide = lectureConceptGuides[profile.key] ?? [
    `「${topic}」的重點是把題目限制轉化為一組可維護的狀態。動筆前先釐清：輸入中哪些資訊會左右未來決策，哪些只是當下用來更新答案。`,
    "即使做法看似模板，也必須能說出它維護了什麼事實。講義中的不變式正是用來檢查每一步更新是否正確的工具。",
  ];

  return ["**觀念起點**", ...concept_guide].join("\n\n");
}

const rating2100PhaseGuides: Record<
  number,
  { concepts: string[]; focus: string[] }
> = {
  2: {
    concepts: [
      "本階段的目標是把 1700 級的常見模型穩定寫對。每題建議拆成三件事：輸入規模允許何種複雜度、題目訊號指向哪個基礎 pattern、答案在掃描或 DP 的哪一刻更新。",
      "1700 題常見錯誤多半不在演算法本身，而在於少放一維狀態、未處理邊界，或把二分、滑窗、貪心的適用條件混為一談。重點是建立「先判斷條件，再套工具」的習慣。",
    ],
    focus: [
      "二分：先確認 predicate 單調，再決定找第一個或最後一個合法值。",
      "資料結構：只維護查詢真正需要的摘要，如 heap top、Fenwick 前綴計數、set 前驅後繼。",
      "DP：先用一句話定義狀態，再由最後一步推轉移。",
      "圖與網格：先判斷邊權是否等權，再決定 BFS、0-1 BFS 或 Dijkstra。",
    ],
  },
  14: {
    concepts: [
      "1800 至 1900 的題目開始要求把兩種基礎工具接起來。常見模式是先排序或枚舉固定一個維度，再用資料結構、前綴資訊或 DP 處理另一維度。",
      "本階段練的是限制轉換：不等式能否移項為排名查詢、子陣列條件能否化為前綴狀態、圖邊能否按門檻離線加入。題目不會明寫 pattern 名稱，需自行把語意改寫成可維護的狀態。",
    ],
    focus: [
      "排序加掃描：排序後判斷哪些候選已合法、哪些仍不能放入資料結構。",
      "前綴狀態：把子陣列或子字串條件改寫為當前狀態與歷史狀態的關係。",
      "離線查詢：讓門檻單調移動，避免每個 query 重跑一次。",
      "DP 優化：先寫樸素轉移，再找可維護的最佳前驅。",
    ],
  },
  27: {
    concepts: [
      "1900 至 2000 的題目通常混合建模、證明與實作細節三類元素。僅知道模板名稱並不夠，必須能解釋為何掃描順序不漏答案、為何貪心選擇安全，或為何某個狀態支配另一狀態。",
      "本階段適合把題目完整拆解為輸入轉換、狀態語意、不變式與複雜度。任一步若只能憑直覺說明，往往代表證明未盡，容易在相等元素、負數、重複值或不連通情形上出錯。",
    ],
    focus: [
      "貢獻法：固定某元素作為最小值、最大值或中心，計算其負責的範圍。",
      "狀態 BFS：座標之外還需納入 mask、剩餘資源或時間。",
      "圖論：明確區分連通性、最短路、環、DAG、SCC 與橋。",
      "字串：先判斷昂貴比較是固定 pattern、前綴 LCP 還是任意子串相等。",
    ],
  },
  40: {
    concepts: [
      "2000 至 2100 的重點是穩定輸出完整解法。題目往往不只考單一演算法，而要求讀題後快速判斷主要瓶頸，並挑選同時滿足時間、空間與邊界條件的組合。",
      "本階段建議先讀解法的核心不變式，再看程式碼。不變式清楚時，實作只是把狀態更新寫對；不變式模糊時，程式即使通過樣例也容易在隱藏測資失敗。",
    ],
    focus: [
      "高階資料結構：用 Fenwick、segment tree、set 或 heap 維護查詢所需的最小充分資訊。",
      "多階段圖論：多次 Dijkstra、反圖、分層圖或枚舉匯合點。",
      "DP 組合：排序、二分、單調資料結構與 DP 狀態互相配合。",
      "數學與構造：先找不變量、必要條件與可行性證明，再落實到實作。",
    ],
  },
};

function buildRating2100SpecialTopicContent(indexed: IndexedTutorialSection) {
  if (!indexed.title.includes("固定一個維度")) return undefined;

  return [
    [
      "**觀念起點**",
      "這個難度最需要練的是「固定一個維度」。固定右端點後，左側能不能用 hash、Fenwick 或 set 維護？固定答案後，能不能用貪心 check？固定一個節點後，其他距離能不能由預處理表查到？題目的突破口通常來自這種改寫。",
      "固定一維不是少想一維，而是先把題目的自由度壓成一條掃描線、一個候選答案或一個中心點。剩下的資訊若能變成查詢、判定或預處理表，原本看似要雙重枚舉的題目就會降到 `O(n log n)` 或接近線性。",
    ].join("\n\n"),
    [
      "**三種常見固定方式**",
      formatList([
        "固定右端點：從左到右掃描，把所有可能左端點放進 hash、Fenwick、set、heap 或單調結構，只查目前 right 需要的歷史摘要。",
        "固定答案：把最小化最大值、最大化最小值或可達門檻改成 `can(answer)`，再用貪心、BFS/DFS 或資料結構檢查單調 predicate。",
        "固定節點或中心：在樹、圖或字串中枚舉一個匯合點、根、中心、分界點，其他距離、祖先、LCP 或前後綴資訊由預處理表回答。",
      ]),
    ].join("\n\n"),
    [
      "**解題流程**",
      formatSteps([
        "先由限制估目標複雜度。`n <= 2e5` 時，雙重枚舉通常需要被改寫成掃描加查詢。",
        "選一個維度固定：右端點、左端點、排序後的位置、答案值、圖上匯合點或樹根。",
        "寫出固定後的查詢：需要歷史中有多少個、最大/最小是哪個、是否存在、距離是多少，或可行性是否成立。",
        "選維護工具：hash 處理等值與餘數，Fenwick/segment tree 處理排名與前綴，set 處理前驅後繼，預處理表處理多次距離或區間查詢。",
        "用不變式檢查更新順序：答案查詢必須只使用已合法的候選，更新時不能把當前元素提前放進左側集合。",
      ]),
    ].join("\n\n"),
    [
      "**例題模型：固定右端點 + Fenwick**",
      "**完整問題**：給定整數陣列 `nums` 與整數 `k`，計算有多少個非空連續子陣列的和至少為 `k`。陣列可能包含負數，因此不能直接用滑動視窗。",
      "令 `prefix[i]` 是前 i 個數的總和。固定右端點 `right` 後，需要計算有多少個左端點 `left < right` 滿足 `prefix[right] - prefix[left] >= k`，也就是 `prefix[left] <= prefix[right] - k`。掃描 right 時，左側 prefix 都已經出現過，用 Fenwick 維護壓縮後的 prefix 排名數量即可。",
    ].join("\n\n"),
    [
      "**C++：固定右端點後查左側數量**",
      "```cpp\nclass Fenwick {\n    vector<int> bit_;\n\npublic:\n    Fenwick(int n) : bit_(n + 1) {}\n\n    void add(int index, int delta) {\n        for (++index; index < (int)bit_.size(); index += index & -index) {\n            bit_[index] += delta;\n        }\n    }\n\n    int prefixSum(int index) const {\n        int sum = 0;\n        for (++index; index > 0; index -= index & -index) {\n            sum += bit_[index];\n        }\n        return sum;\n    }\n};\n\nlong long countSubarraysAtLeastK(vector<int>& nums, long long k) {\n    int n = nums.size();\n    vector<long long> prefix(n + 1);\n    for (int i = 0; i < n; ++i) prefix[i + 1] = prefix[i] + nums[i];\n\n    vector<long long> values = prefix;\n    sort(values.begin(), values.end());\n    values.erase(unique(values.begin(), values.end()), values.end());\n\n    Fenwick bit(values.size());\n    long long answer = 0;\n    for (long long current : prefix) {\n        long long need = current - k;\n        int last = upper_bound(values.begin(), values.end(), need) - values.begin() - 1;\n        if (last >= 0) answer += bit.prefixSum(last);\n\n        int rank = lower_bound(values.begin(), values.end(), current) - values.begin();\n        bit.add(rank, 1);\n    }\n    return answer;\n}\n```",
    ].join("\n\n"),
    [
      "**複盤問題**",
      formatList([
        "如果固定右端點，左側集合何時加入、何時刪除？相等元素要算幾次？",
        "如果固定答案，`can(x)` 是否真的單調？貪心 check 的局部選擇有沒有證明？",
        "如果固定節點，哪些資訊能先預處理：距離、祖先、子樹大小、前後綴最佳值或 LCP？",
        "目前做法的瓶頸是哪一層枚舉？被固定後是否已經變成一次查詢或一次合併？",
      ]),
    ].join("\n\n"),
  ].join("\n\n---\n\n");
}

function buildRating2100PhaseContent(
  indexed: IndexedTutorialSection,
  studySection: StudyPlanData.Section | undefined,
) {
  const guide = rating2100PhaseGuides[indexed.id];
  if (!guide) return undefined;

  const children = studySection?.children ?? [];
  const representative_problems = flattenProblems(studySection)
    .filter((problem) => (getProblemRating(problem) ?? 0) >= EXAMPLE_MIN_RATING)
    .sort((a, b) => (getProblemRating(a) ?? 0) - (getProblemRating(b) ?? 0))
    .slice(0, 6);

  return [
    ["**觀念起點**", ...guide.concepts].join("\n\n"),
    ["**本階段訓練重點**", formatList(guide.focus)].join("\n\n"),
    children.length > 0
      ? [
          "**本階段章節地圖**",
          formatList(
            children.map((child) => {
              const problem_count = flattenProblems(child).length;
              return `${child.title}：${problem_count} 題`;
            }),
          ),
        ].join("\n\n")
      : undefined,
    representative_problems.length > 0
      ? [
          "**本階段檢核題**",
          formatList(
            representative_problems.map((problem) => {
              const problem_id = getProblemDisplayId(problem);
              const prefix = problem_id ? `LeetCode ${problem_id} ` : "";
              const rating = getProblemRating(problem);
              return `${prefix}${getProblemDisplayTitle(problem)}${
                typeof rating === "number"
                  ? `，rating ${Math.round(rating)}`
                  : ""
              }`;
            }),
          ),
        ].join("\n\n")
      : undefined,
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");
}

function formatProblemReference(
  example: StudyPlanData.Item | undefined,
  isFromStudyPlan: boolean,
) {
  if (!example) return "本節以本章標準模型題作為講解主線。";
  const problem_id = getProblemDisplayId(example);
  const rating = getProblemRating(example);
  const problem_label = problem_id
    ? `LeetCode ${problem_id}「${getProblemDisplayTitle(example)}」`
    : `「${getProblemDisplayTitle(example)}」`;
  const source = isFromStudyPlan ? "題單中的 " : "";
  return `本節以 ${source}${problem_label} 為主例題${
    typeof rating === "number" ? `（rating ${Math.round(rating)}）` : ""
  }，並將同一套不變式延伸至本節其他題目。`;
}

function formatProblemHeading(
  example: StudyPlanData.Item | undefined,
  fallbackTitle: string,
) {
  if (!example) return fallbackTitle;
  const problem_id = getProblemDisplayId(example);
  const prefix = problem_id ? `LeetCode ${problem_id} ` : "";
  return `${prefix}${getProblemDisplayTitle(example)}`;
}

function buildRelatedProblems(studySection: StudyPlanData.Section | undefined) {
  const problems = flattenProblems(studySection).slice(0, 5);
  if (problems.length === 0) return undefined;

  return [
    "**本節題單中的延伸題**",
    formatList(
      problems.map((problem) => {
        const rating =
          typeof getProblemRating(problem) === "number"
            ? `，rating ${Math.round(getProblemRating(problem)!)}`
            : "";
        const problem_id = getProblemDisplayId(problem);
        const prefix = problem_id ? `LeetCode ${problem_id} ` : "";
        return `${prefix}${getProblemDisplayTitle(problem)}${rating}`;
      }),
    ),
  ].join("\n\n");
}

function normalizeGoogleContent(content: string) {
  return content.replace(/\n\n題目：/g, "\n\n**完整問題**：");
}

function buildGenericSectionContent(
  planKey: string,
  indexed: IndexedTutorialSection,
  studySection: StudyPlanData.Section | undefined,
) {
  const rating_2100_special_content =
    planKey === "rating_2100"
      ? buildRating2100SpecialTopicContent(indexed)
      : undefined;
  if (rating_2100_special_content) {
    return rating_2100_special_content;
  }

  const rating_2100_phase_content =
    planKey === "rating_2100"
      ? buildRating2100PhaseContent(indexed, studySection)
      : undefined;
  if (rating_2100_phase_content) {
    return rating_2100_phase_content;
  }

  const { section } = indexed;
  const picked_example = pickExampleProblem(studySection);
  const baseProfile = findLectureTopicProfile({
    planKey,
    section,
    studySection,
    pathTitles: indexed.pathTitles,
    example: picked_example,
  });
  const has_picked_specific_profile =
    picked_example && hasExampleLectureProfile(baseProfile, picked_example);
  const example = has_picked_specific_profile
    ? picked_example
    : getDefaultLectureExample(baseProfile);
  const isFromStudyPlan = Boolean(has_picked_specific_profile);
  const profile = mergeExampleProfile(baseProfile, example);
  const topic = formatLectureTopicTitle(section);
  const extra = lectureProfileExtras[baseProfile.key];
  const pitfalls = extra?.extraPitfalls
    ? [...profile.pitfalls, ...extra.extraPitfalls]
    : profile.pitfalls;
  const complexityText = extra?.complexityNote
    ? `${profile.complexity} ${extra.complexityNote}`
    : profile.complexity;
  const conceptPrimer = buildConceptPrimer(topic, profile);
  const relatedProblems = buildRelatedProblems(studySection);
  const templateNote = extra?.templateNote
    ? ["**同一模板的套用要點**", extra.templateNote].join("\n\n")
    : undefined;

  // Each section is anchored on a single representative problem: the concept
  // primer, then one problem statement followed by its signals, invariants,
  // derivation, walkthrough, patterns, pitfalls and complexity. There is no
  // separate abstract-model block, so nothing is restated twice.
  return [
    conceptPrimer,
    [
      `**代表例題：${formatProblemHeading(example, topic)}**`,
      `**完整問題**：${profile.modelProblem}`,
      formatProblemReference(example, isFromStudyPlan),
      "**題目訊號**",
      formatList(profile.signals),
      "**狀態、不變式與答案更新**",
      formatList(profile.invariants),
      "**從零建模**",
      formatSteps(profile.derivation),
      ...(extra?.walkthrough ? ["**小範例手動模擬**", extra.walkthrough] : []),
      "**常見模式**",
      formatList(profile.patterns),
      "**常見錯誤**",
      formatList(pitfalls),
      `**複雜度**：${complexityText}`,
    ].join("\n\n"),
    relatedProblems,
    templateNote,
    ["**C++ 實作骨架**", profile.code].join("\n\n"),
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");
}

function getPlanTitle(planKey: string) {
  return STUDYPLANS[planKey as keyof typeof STUDYPLANS] ?? planKey;
}

function getPlanNavItems(planKey: string): IndexedTutorialSection[] {
  return flattenTutorialSections(tutorialDataMap[planKey]?.children);
}

export function getLectureSectionStaticParams() {
  return Object.keys(tutorialDataMap).flatMap((category) =>
    getPlanNavItems(category).map((section) => ({
      category,
      section: section.slug,
    })),
  );
}

export function getLectureSectionTutorial(
  planKey: string,
  sectionSlug: string,
): LectureSectionTutorial | undefined {
  const tutorialRoot = tutorialDataMap[planKey];
  if (!tutorialRoot) return undefined;

  const sections = getPlanNavItems(planKey);
  const index = sections.findIndex(
    (item) => item.slug === sectionSlug || String(item.id) === sectionSlug,
  );
  const indexed = sections[index];
  if (!indexed) return undefined;

  const googleSection =
    planKey === "google_interview"
      ? getGoogleInterviewSectionTutorial(indexed.slug)
      : undefined;
  const studySection = findStudyPlanSectionById(
    studyPlanDataMap[planKey]?.children,
    indexed.id,
  );
  const content = googleSection
    ? normalizeGoogleContent(googleSection.content)
    : buildGenericSectionContent(planKey, indexed, studySection);

  return {
    id: indexed.id,
    title: indexed.title,
    slug: indexed.slug,
    planKey,
    planTitle: getPlanTitle(planKey),
    pathTitles: indexed.pathTitles,
    content,
    practiceProblems: flattenProblems(studySection),
    navItems: sections.map(({ id, title, slug, depth }) => ({
      id,
      title,
      slug,
      depth,
    })),
    children: (indexed.section.children ?? []).map((child) => {
      const childSlug = sectionAnchor(child.title);
      const childStudySection = findStudyPlanSectionById(
        studyPlanDataMap[planKey]?.children,
        child.id,
      );
      const childProblems = flattenProblems(childStudySection);

      return {
        id: child.id,
        title: child.title,
        slug: childSlug,
        depth: indexed.depth + 1,
        summary: child.summary,
        childCount: child.children?.length ?? 0,
        totalSections: countTutorialSections(child),
        practiceProblemCount: childProblems.length,
        practiceProblemIds: getProblemIds(childProblems),
      };
    }),
    previous:
      index > 0
        ? {
            id: sections[index - 1]!.id,
            title: sections[index - 1]!.title,
            slug: sections[index - 1]!.slug,
            depth: sections[index - 1]!.depth,
          }
        : undefined,
    next:
      index >= 0 && index < sections.length - 1
        ? {
            id: sections[index + 1]!.id,
            title: sections[index + 1]!.title,
            slug: sections[index + 1]!.slug,
            depth: sections[index + 1]!.depth,
          }
        : undefined,
  };
}
