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

export interface LectureSectionNavItem {
  id: number;
  title: string;
  slug: string;
  depth: number;
}

export interface LectureSectionTutorial {
  id: number;
  title: string;
  slug: string;
  planKey: string;
  planTitle: string;
  content: string;
  navItems: LectureSectionNavItem[];
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
    "二分搜尋的核心不是「切一半」本身，而是找到一條由 false 變 true、或由 true 變 false 的分界線。陣列已排序時，分界線通常是某個值第一次出現的位置；答案具單調性時，分界線則是第一個可行答案或最後一個可行答案。",
    "初學者要先分清楚兩件事：搜尋的是下標，還是搜尋答案值。搜尋下標時，predicate 通常長得像 `nums[mid] >= target`；搜尋答案時，predicate 通常是 `can(mid)`。只要 predicate 的真假沒有單調排列，二分就沒有根基。",
    "半開區間 `[left, right)` 的好處是迴圈結束時 `left == right`，答案位置自然落在同一個變數上。每次更新邊界時，都要能說清楚被丟掉的那半邊為什麼不可能含有答案。",
  ],
  "kth-smallest": [
    "第 K 小題的困難在於候選數量通常很大，不能真的全部列出再排序。常見做法有兩類：若只要第 K 小的值，常用二分答案加計數；若要依序產生前 K 個候選，常用 heap 維護目前可見的邊界。",
    "從零建模時，先問候選集合能不能被切成多條有序鏈。例如矩陣每列有序、pair sum 對其中一個下標遞增，這些都能讓 heap 每次只保存每條鏈的下一個候選，而不必保存整個笛卡兒積。",
    "若使用二分答案，重點是設計 `count(x)`：有多少候選值 `<= x`。若 `count(x) >= k`，表示第 K 小不大於 x；若不足，表示答案更大。這個計數函式通常比真正列出候選便宜很多。",
  ],
  "binary-answer": [
    "二分答案適合處理「最小化最大值」或「最大化最小值」這類題。原題看起來像最佳化，但固定一個候選答案後，問題會變成判斷題：這個上限夠不夠？這個下限能不能達到？",
    "初學時不要急著寫 while。先用一句話定義 `can(x)`，再判斷 true 的方向。例如容量越大越容易運完貨，速度越快越容易準時吃完，距離越大越難放下更多點。方向判斷錯，二分邊界必錯。",
    "check 函式只回答可不可行，不在裡面順便求最優。這能讓證明清楚：二分負責找邊界，check 負責維護單調性。",
  ],
  "prefix-sum": [
    "前綴和把「一段連續區間」改寫成兩個前綴狀態的差。這是初學者最重要的轉換：不要每次重新加總 `[left,right]`，而是記住到目前為止累積了多少，區間和就能用 `prefix[right] - prefix[left]` 得到。",
    "當題目問子陣列數量時，掃描到右端點並不需要回頭枚舉所有左端點。你只要知道過去出現過哪些前綴狀態，以及各出現幾次，就能一次算出以目前位置結尾的合法區間數。",
    "前綴狀態不一定只是 sum。遇到同餘時，狀態可以是 `sum % k`；遇到字母奇偶時，狀態可以是 bitmask。關鍵是子區間的性質能否由「現在狀態」與「過去狀態」合成。",
  ],
  "enumerate-maintain": [
    "列舉維護的思想是固定一個角色，讓其他資訊變成已知歷史。暴力枚舉 pair 或 triple 時，通常有一層枚舉可以改成「掃描到目前為止的最佳值、最小值、計數表或集合」。",
    "從零開始時，先決定掃描順序。若枚舉右端點，左側資料結構只能包含右端點之前的元素；若枚舉中間點，左右兩側的資訊要分開維護。加入元素的時機會直接影響是否把自己配到自己。",
    "這類題的正確性常來自不漏不重：每個答案組合都在某個固定位置被計算一次，且資料結構保存的候選剛好是能與它配對的那一側。",
  ],
  "rating-2100-data-structure": [
    "Rating 2100 的資料結構題通常不是單純問某個容器怎麼用，而是要求你把題目拆成事件、候選集合與查詢。初學時先不要急著選 Fenwick 或 segment tree，先寫出每次操作到底需要查什麼：前綴數量、區間最大值、前驅後繼、過期最大值，還是連通性。",
    "這個難度常見的轉換是「排序後讓一個條件單調」。一旦門檻單調，資料就能一批批加入；查詢時資料結構中剛好保存目前合法候選。這也是離線排序、掃描線與 DSU 門檻查詢的共同基礎。",
    "選資料結構時要同時檢查更新方向。只加不刪可用 Fenwick 或 DSU；需要刪過期候選常用 heap lazy deletion 或 set；需要區間合併資訊才考慮 segment tree。",
  ],
  "difference-array": [
    "差分陣列是前綴和的反向思考。若原陣列記錄每個位置的值，差分陣列記錄的是相鄰位置之間的變化。對一整段加同一個值，只會影響區間開始與結束後一格兩個邊界。",
    "它適合大量區間更新、最後才統一讀答案的情境。每次 `[l,r]` 加 delta 時，在 `diff[l]` 加 delta，並在 `diff[r+1]` 減 delta；最後做一次前綴和，就能把所有更新疊回每個位置。",
    "差分不適合更新與查詢交錯的題，因為它把結果延後到最後才還原。若每次更新後都要即時查區間和或最大值，通常要改用 Fenwick 或 segment tree。",
  ],
  fenwick: [
    "Fenwick tree 可以理解成很多個負責不同長度區間的小桶。每個位置 `i` 的桶長度由 `lowbit(i)` 決定；更新一個點時，要把所有包含這個點的桶都更新；查前綴和時，則沿著桶往前跳。",
    "它解決的是「資料會變動，但仍想快速查前綴資訊」的問題。普通前綴和查詢快但更新慢；Fenwick 把單點更新與前綴查詢都壓到 `O(log n)`。",
    "初學者最常犯的錯是 0-index 與 1-index 混用。Fenwick 內部通常用 1-index，因為 `index += index & -index` 和 `index -= index & -index` 需要 index 不為 0。",
  ],
  dsu: [
    "並查集維護的是「哪些元素目前屬於同一個集合」。它不記錄路徑長度，也不記錄具體路徑；它只回答兩個點是否已經透過加入過的關係連在一起。",
    "每個集合有一個代表元。`find(x)` 找到 x 所屬集合的代表，`unite(a,b)` 把兩個集合合併。路徑壓縮與按大小合併讓操作均攤接近常數。",
    "它特別適合邊逐步加入的連通性問題。若題目需要刪邊、查最短路、或知道連通路徑包含哪些點，普通 DSU 就不夠。",
  ],
  "monotonic-stack": [
    "單調棧保存的是一批尚未被解決的元素。當新元素出現並破壞棧的單調性時，被彈出的元素就找到了自己的右側邊界，例如下一個更大值、下一個更小值或貢獻範圍。",
    "它不是為了把資料排序，而是為了讓每個元素只被處理常數次。暴力往右找第一個更大元素會重複掃描；單調棧把這些等待中的元素集中起來，等到答案出現時一次解決。",
    "若題目要算子陣列極值貢獻，棧內通常存 index 而不是 value，因為答案需要左右距離。相等元素要規定由左邊或右邊負責，否則會重複計數。",
  ],
  "sliding-window": [
    "滑動視窗處理的是連續區間。右端點負責加入新元素，左端點負責移除舊元素；整個過程只向前走，不回頭枚舉所有區間。",
    "它成立的前提是窗口狀態可以局部更新，而且合法性對窗口長短有某種可控方向。例如最多 K 種、最多 K 個 0、總和不超過某值等條件，通常能靠移動左端恢復合法。",
    "計數題要特別小心貢獻方式。對固定右端點，有些題加窗口長度，有些題在合法後加後面所有右端點數量；先寫出「固定一端時有多少選擇」再寫程式。",
  ],
  knapsack: [
    "背包 DP 的核心是資源容量。每個物品會消耗重量、成本或名額，並帶來價值、方案數或可行性。狀態 `dp[cap]` 表示在容量 cap 下，目前已處理物品能得到的結果。",
    "0-1 背包與完全背包的差別不在公式外觀，而在同一個物品能不能重複使用。0-1 背包容量倒序，避免同輪再次拿同一物品；完全背包容量正序，允許同一物品多次被使用。",
    "寫背包前先判斷答案型態：最大值、最小值、可不可行、方案數。不同型態的初始化不同，例如方案數通常 `dp[0]=1`，最小化通常先設為無限大。",
  ],
  "grid-dp": [
    "網格 DP 把每個格子視為一個狀態。若移動方向只有向右、向下，或依值大小形成 DAG，那麼填表順序能保證轉移來源已經算好。",
    "初學者要先確認圖是否有環。只能往右下走的路徑計數是 DP；可以上下左右任意走的最短路通常是 BFS 或 Dijkstra，不是普通填表。",
    "邊界條件是網格 DP 的一部分，不是附加細節。第一列、第一行、障礙格、起點初始化如果語意不清，後面公式即使正確也會算錯。",
  ],
  "grid-state-bfs": [
    "網格題可以先當成一張沒有明寫邊的圖：每個格子是節點，四方向或八方向是邊。若每一步成本相同，BFS 能保證第一次到達某個完整狀態就是最短距離。",
    "關鍵在於「完整狀態」不一定只有座標。同一格如果剩餘消除次數不同、鑰匙集合不同、方向不同或時間不同，後續能走的路就不同，因此 visited 或 dist 必須把這些資訊放進去。",
    "狀態維度增加後，先估狀態數。`rows * cols * k` 可以接受時用 BFS；若邊權不是等權，改用 0-1 BFS 或 Dijkstra；若 k 大到一定能直走，也可以先用限制推導剪枝。",
  ],
  "dp-linear": [
    "線性 DP 研究的是序列上一步一步做決策。常見問題是處理到第 i 個元素時，要不要選它、要接在哪個前一狀態後面、或最後一段從哪裡切開。",
    "設計狀態時，不要把 `dp[i]` 寫成模糊的「目前答案」。要說清楚它是前 i 個元素的最佳值、以 i 結尾的最佳值、還是處理到 i 且處於某種狀態的答案。",
    "轉移通常來自最後一步。先問最後一次操作是什麼，再往回找它依賴哪些較小狀態。這能把暴力搜尋整理成有方向的表格。",
  ],
  "rating-2100-dp": [
    "Rating 2100 的 DP 題通常已經不是只寫一個一維陣列。題目會把序列、限制次數、集合、圖或排序條件放在一起，要求你先找出「未來還需要知道哪些資訊」。這些資訊才是狀態維度。",
    "從零設計時，先寫暴力搜尋的函式參數，再問哪些參數會重複出現。若同一組參數的未來完全相同，就可以 memo；若轉成迭代，計算順序必須保證所有依賴狀態已經算好。",
    "優化 DP 時不要直接背名字。先保留樸素轉移，例如 `dp[i] = max(dp[j] + value)`，再觀察 j 的合法範圍是否是前綴、窗口、排序前驅或一條線。資料結構只是用來快速找最佳 j。",
  ],
  "graph-bfs-dfs": [
    "圖搜尋的第一步是定義節點與邊。節點不一定是題目明說的城市或人，也可能是網格座標、字串狀態、已拿鑰匙集合或剩餘資源。",
    "DFS 適合把一個連通塊走完、做遞迴回溯或合併子樹資訊；BFS 適合每條邊代價相同的最短步數，因為第一次到達某狀態時距離最短。",
    "visited 的維度要和狀態一致。若同一格帶著不同鑰匙集合、不同剩餘消除次數會影響未來，那它們就是不同狀態，不能只用座標去重。",
  ],
  "topological-dp": [
    "拓撲排序處理的是有向依賴：某件事必須在另一件事之前完成。入度為 0 代表目前沒有未完成前置條件，可以先處理。",
    "若圖中有環，就不存在合法的線性處理順序。這就是為什麼拓撲排序同時能排程，也能檢查依賴是否矛盾。",
    "DAG 上 DP 的關鍵是順序。當一個節點被拓撲順序處理時，它的所有前驅都已經把資訊傳給它，因此可以安全地更新最早完成時間、最長路或方案數。",
  ],
  dijkstra: [
    "Dijkstra 解決非負邊權最短路。它每次從 priority queue 取出目前距離最小的狀態；在非負權前提下，這個狀態之後不可能再被更短路徑改善。",
    "鬆弛是最短路的基本動作：若經過目前節點能讓鄰居距離變小，就更新鄰居並放回候選集合。priority queue 中可能有舊距離，取出時要檢查是否仍等於最新距離。",
    "若題目有折扣、剩餘次數、方向或時間，狀態要擴展成 `(node, extra_state)`。只用 node 當距離表會把未來能力不同的情況混在一起。",
  ],
  mst: [
    "最小生成樹要在無向圖中選出連通所有點的 `n-1` 條邊，且總權重最小。它不是最短路：MST 關心整張網路的建設成本，不關心某兩點之間的路徑是否最短。",
    "Kruskal 的想法是從最便宜的邊開始考慮。若一條邊連接兩個不同連通塊，加入它能讓森林更連通；若兩端已連通，加入它只會形成 cycle，沒有必要。",
    "正確性來自 cut property：跨過某個切分的最小邊一定可以出現在某棵 MST 中。DSU 在程式中負責快速判斷這條邊是否跨越兩個不同 component。",
  ],
  "low-link": [
    "low-link 題先把 DFS 走出的樹和原圖中的回邊分開看。`dfn[u]` 是節點第一次被看到的時間，`low[u]` 是 u 或其子樹能回到的最早祖先時間。",
    "在無向圖中，若 child 子樹沒有任何回邊能回到 parent 或更早祖先，parent-child 這條 tree edge 就是橋；刪掉它會讓 child 子樹和外界斷開。",
    "在有向圖的 SCC 中，low 值用來判斷一批節點是否仍在同一個互相可達區域。學這類題時，先畫 DFS tree，再標出 back edge，比直接背 Tarjan 模板穩定得多。",
  ],
  "network-flow": [
    "網路流把問題看成從 source 往 sink 輸送某種資源，每條邊有容量上限。流量守恆表示中間節點不能憑空產生或消失流量。",
    "殘量圖是理解最大流的核心。每送一點流量，就要在反向邊上留下可撤銷的容量，代表之後若發現更好的安排，可以把先前的流量退回來重分配。",
    "很多匹配、最小割、選或不選的限制題都能建成流圖。建模時先決定每個限制應該變成節點容量、邊容量，還是 source/sink 兩側的連接。",
  ],
  "greedy-interval": [
    "區間貪心的第一步是決定排序鍵。若目標是選最多不重疊區間，按右端點排序通常合理，因為越早結束越能留下更多後續空間。",
    "貪心不能只說「看起來最好」。要能做交換論證：任意一個最優解，如果第一個選的不是最早結束區間，就把它換成最早結束區間，後續可選空間不會變小。",
    "區間題要先釐清端點語意。閉區間、半開區間、是否允許端點相接，會直接決定判斷式使用 `>` 還是 `>=`。",
  ],
  "math-number-theory": [
    "數論題的第一步通常是把題目文字翻成整除、餘數、質因數或 gcd。這些表示法能揭露原本看不見的結構，例如兩數能交換是因為共享質因數。",
    "質因數分解把乘法問題拆成每個 prime 的指數問題；gcd 把共同因子壓成一個值；同餘把無限整數壓到有限餘數類。這些都是降低狀態大小的方法。",
    "要特別注意整數溢位與模除法。`lcm(a,b)` 應先除以 gcd 再乘；在模數下做除法時，只有除數可逆才能用乘逆元替代。",
  ],
  kmp: [
    "KMP 解決的是固定 pattern 在 text 中匹配時的重複比較。暴力失配後會把 pattern 重頭開始，KMP 則利用 pattern 自己的前後綴重疊資訊，保留仍可能匹配的部分。",
    "`pi[i]` 表示 `pattern[0..i]` 的最長相等真前後綴長度。失配時，這個值告訴我們 pattern 可以退到哪裡，而不用把已知相等的字元重新比一次。",
    "KMP 的本質不是字串魔法，而是狀態回退。`matched` 表示目前匹配了多少個 pattern 前綴；每次失配都沿著 border 鏈回到下一個可能狀態。",
  ],
  "tree-linked-binary": [
    "鏈表和樹都屬於指標結構。鏈表修改前要先保存下一個節點，否則斷鏈後會丟失後半段；樹遞迴前要先定義每個 DFS 呼叫要回傳什麼資訊。",
    "二元樹題常分成自頂向下與自底向上。自頂向下把祖先資訊傳給孩子；自底向上先解決左右子樹，再把高度、路徑和、是否平衡等資訊回傳給父節點。",
    "路徑題要分清楚「可以往父節點延伸的單邊路徑」和「只在當前子樹內形成的完整答案」。很多全域答案是在回溯時由左右子樹合併更新的。",
  ],
  "bitwise-contribution": [
    "位元題的優勢是每個 bit 通常可以分開討論。對 XOR、OR、AND 這類運算，先看單一 bit 在什麼情況下變成 1，再把每一位的貢獻乘回權重。",
    "XOR 的某位為 1，代表該位上的 1 的數量是奇數，或兩個數在該位不同；OR 的某位為 1，只要至少一個候選提供該位；AND 則要求所有相關元素都提供該位。",
    "高位貪心常從最高位往低位試填，因為高位的價值大於所有低位總和。只要能檢查目前高位前綴是否可行，就可以逐步固定答案。",
  ],
  "linear-basis": [
    "XOR 線性基把整數看成 GF(2) 上的向量。選取子集做 XOR 等價於把一些向量相加，問題就變成這些向量能生成哪些值。",
    "每個 basis 位置保存最高位固定的一個代表向量。插入新數時，用已有基向量消去最高位；若最後變成 0，表示它已經能由舊向量組合出來，不會增加生成能力。",
    "求最大 XOR 時從高位往低位嘗試讓答案變大。若 `answer ^ basis[bit]` 更大，就採用它，因為高位收益優先於低位。",
  ],
  "greedy-general": [
    "貪心題的重點是證明局部選擇不會破壞最優性。若只能說「我覺得先選這個比較好」，還不是完整解法；要能用交換論證、反悔或排序不等式說明。",
    "反悔貪心先暫時接受候選，等限制被破壞時，再從已接受集合中移除最不值得保留的元素。heap 的角色就是快速找到這個應該被反悔的元素。",
    "這類題常有一個逐步擴張的限制，例如時間、資源、前綴和、可到達位置。掃描順序讓限制單調變化，heap 或 set 則維護目前仍可留下的候選集合。",
  ],
  manacher: [
    "Manacher 解決的是每個中心向外擴展回文時的重複比較。普通中心擴展最壞會反覆掃過同一段字元；Manacher 利用已知最右回文區間的鏡射中心，給新中心一個初始半徑。",
    "它維護的 `[left,right]` 是目前右端最遠的回文。若新中心 i 落在這個區間內，i 的鏡射點已經算過半徑，因此可以先繼承一部分，再只對未知區域繼續擴展。",
    "學 Manacher 時要固定半徑定義。半徑是包含中心的格數、左右可延伸長度，還是處理後字串的半徑，會影響最後換算答案。",
  ],
  "string-tools": [
    "字串工具的差別在於它們加速的比較種類不同。KMP 處理固定 pattern 匹配；Z function 處理每個後綴和整串前綴的 LCP；rolling hash 處理任意兩段子字串比較；Trie 處理多字典詞共享前綴。",
    "選工具前先問：昂貴操作是什麼？如果是反覆從某位置開始和 pattern 比，KMP/Z 合適；如果是任意子串相等判斷，hash 或後綴結構更合適；如果是大量詞的前綴查詢，Trie 更自然。",
    "不要把所有字串題都套同一個模板。工具只是讓比較變快，真正的解法還要看外層是 DP、二分、貪心、圖搜尋還是資料結構維護。",
  ],
  "combinatorics-geometry": [
    "組合計數的目標是讓每個物件被計算一次且只計算一次。若選擇可以分階段獨立完成，常用乘法原理；若不同計數集合互相重疊，就需要容斥或 DP 拆開。",
    "放球問題、排列組合、質因數指數分配，本質都是把一批相同或不同的選擇分到若干位置。先判斷物品是否可區分、盒子是否可區分、是否允許空盒，公式才會正確。",
    "幾何題則要先把圖形關係改成向量運算。叉積判方向與面積，點積判角度與投影；處理共線、重點與浮點誤差往往比公式本身更重要。",
  ],
};

function buildConceptPrimer(topic: string, profile: LectureTopicProfile) {
  const concept_guide = lectureConceptGuides[profile.key] ?? [
    `「${topic}」的重點是把題目限制轉成一組可維護的狀態。開始寫程式前，先確認輸入中哪些資訊會影響未來決策，哪些資訊只是在當下用來更新答案。`,
    "若一個做法看起來像模板，仍要能說出它維護了什麼事實。講義中的不變式就是用來檢查每一步更新是否正確的工具。",
  ];

  return ["**觀念起點**", ...concept_guide].join("\n\n");
}

const rating2100PhaseGuides: Record<
  number,
  { concepts: string[]; focus: string[] }
> = {
  2: {
    concepts: [
      "這一階段的目標是把 1700 題常見模型穩定寫對。讀者若沒有背景，可以先把每題拆成三件事：輸入規模允許什麼複雜度、題目訊號指向哪個基礎 pattern、以及答案在掃描或 DP 的哪一刻更新。",
      "1700 題常見錯誤不是演算法不會，而是狀態少放一維、邊界沒有處理、或把二分、滑窗、貪心的適用條件混在一起。這個階段要建立的是「先判斷條件，再套工具」的習慣。",
    ],
    focus: [
      "二分：先確認 predicate 單調，再決定找第一個合法值或最後一個合法值。",
      "資料結構：只維護查詢真正需要的摘要，例如 heap top、Fenwick 前綴計數、set 前驅後繼。",
      "DP：先用一句話定義狀態，再由最後一步推轉移。",
      "圖與網格：先判斷邊權是否等權，再選 BFS、0-1 BFS 或 Dijkstra。",
    ],
  },
  14: {
    concepts: [
      "1800 到 1900 的題目開始要求把兩個基礎工具接起來。常見形式是先排序或枚舉固定一個維度，再用資料結構、前綴資訊或 DP 查另一個維度。",
      "這一階段要練的是限制轉換：不等式能不能移項成排名查詢、子陣列條件能不能變成前綴狀態、圖邊能不能按門檻離線加入。題目不會直接寫出 pattern 名稱，需要你自己把語意改寫成可維護狀態。",
    ],
    focus: [
      "排序 + 掃描：排序後確認哪些候選已經合法，哪些仍不能放進資料結構。",
      "前綴狀態：把子陣列或子字串條件改成目前狀態與過去狀態的關係。",
      "離線查詢：讓門檻單調移動，避免每個 query 重跑一次。",
      "DP 優化：先寫樸素轉移，再找可維護的最佳前驅。",
    ],
  },
  27: {
    concepts: [
      "1900 到 2000 的題目通常會混合三個元素：建模、證明與實作細節。只知道模板名稱不夠，必須能解釋為什麼掃描順序不漏答案，為什麼貪心選擇安全，或為什麼某個狀態支配另一個狀態。",
      "這一階段適合把題目完整拆成輸入轉換、狀態語意、不變式與複雜度。若某一步只能用直覺說明，通常代表證明還不完整，也容易在相等元素、負數、重複值或不連通情況出錯。",
    ],
    focus: [
      "貢獻法：固定一個元素作為最小值、最大值或中心，計算它負責的範圍。",
      "狀態 BFS：座標之外還要放入 mask、剩餘資源或時間。",
      "圖論：明確區分連通性、最短路、環、DAG、SCC 與橋。",
      "字串：先判斷昂貴比較是固定 pattern、前綴 LCP 還是任意子串相等。",
    ],
  },
  40: {
    concepts: [
      "2000 到 2100 的重點是穩定輸出完整解法。題目往往不只考某個演算法，而是要求在讀題後快速判斷主要瓶頸，並選擇能同時滿足時間、空間與邊界條件的組合。",
      "這一階段的講義閱讀方式是先看解法的核心不變式，再看程式碼。只要不變式清楚，實作通常只是把狀態更新寫正確；若不變式模糊，程式即使通過樣例也很容易在隱藏測資失敗。",
    ],
    focus: [
      "高階資料結構：用 Fenwick、segment tree、set 或 heap 維護查詢所需的最小充分資訊。",
      "多階段圖論：多次 Dijkstra、反圖、分層圖或枚舉匯合點。",
      "DP 組合：排序、二分、單調資料結構與 DP 狀態互相配合。",
      "數學與構造：先找不變量、必要條件與可行性證明，再落到實作。",
    ],
  },
};

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
          "**可作為本階段檢核的題目**",
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
  if (!example) return "本節使用本章標準模型題作為講解主線。";
  const problem_id = getProblemDisplayId(example);
  const rating = getProblemRating(example);
  const problem_label = problem_id
    ? `LeetCode ${problem_id}「${getProblemDisplayTitle(example)}」`
    : `「${getProblemDisplayTitle(example)}」`;
  const source = isFromStudyPlan ? "題單中的 " : "";
  return `本節以 ${source}${problem_label} 作為主例題${
    typeof rating === "number" ? `（rating ${Math.round(rating)}）` : ""
  }，並把同一套不變式延伸到本節其他題目。`;
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
  const summary = [
    buildConceptPrimer(topic, profile),
    "**本節核心模型**",
    profile.modelProblem,
    "**從零建模**",
    formatSteps(profile.derivation),
  ].join("\n\n");
  const relatedProblems = buildRelatedProblems(studySection);

  return [
    summary,
    [
      `**例題解析：${formatProblemHeading(example, topic)}**`,
      `**完整問題**：${profile.modelProblem}`,
      formatProblemReference(example, isFromStudyPlan),
      "**題目訊號**",
      formatList(profile.signals),
      "**狀態、不變式與答案更新**",
      formatList(profile.invariants),
      "**操作流程**",
      formatSteps(profile.derivation),
      "**常見模式**",
      formatList(profile.patterns),
      "**常見錯誤**",
      formatList(profile.pitfalls),
      `**複雜度**：${profile.complexity}`,
    ].join("\n\n"),
    relatedProblems,
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
    content,
    navItems: sections.map(({ id, title, slug, depth }) => ({
      id,
      title,
      slug,
      depth,
    })),
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
