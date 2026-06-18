import type { TutorialData } from "@/types";

export interface Q3Subtopic {
  title: string;
  blurb: string;
  summary: string;
}

type SubtopicSections = {
  what: string;
  intuition: string;
  when: string;
  how: string;
  mistakes: string;
  checklist: string[];
};

function sub(
  title: string,
  blurb: string,
  sections: SubtopicSections,
): Q3Subtopic {
  const checklist = sections.checklist.map((c) => `- ${c}`).join("\n");
  return {
    title,
    blurb,
    summary: [
      "## 這個主題是什麼",
      sections.what,
      "## 核心直覺",
      sections.intuition,
      "## 什麼時候用",
      sections.when,
      "## 作法與不變式",
      sections.how,
      "## 常見錯誤",
      sections.mistakes,
      "## 檢查清單",
      checklist,
    ].join("\n\n"),
  };
}

export const Q3_SUBTOPICS: Record<number, Q3Subtopic[]> = {
  93005: [
    sub(
      "滑動視窗",
      "用左右指標維護一段連續區間，把枚舉所有子陣列壓成線性掃描。",
      {
        what: "滑動視窗（sliding window）用 `left` 與 `right` 框住一段連續子陣列或子字串。右端負責納入新元素、更新視窗內的摘要；左端在條件違反或需要收縮時往右移。每個元素最多進入與離開視窗各一次，因此整體是 O(n)。",
        intuition:
          "暴力法枚舉所有區間是 O(n²)。若「右端固定時，合法左端形成連續區間」，或「左端固定時，達標右端形成連續區間」，就能把重複檢查壓成單向移動。關鍵不是兩個指標本身，而是你能說清楚視窗內維持的不變式。",
        when: "- 題目明確要求連續子陣列或子字串。\n- 限制涉及最多/至少 K 次替換、刪除、不同值、零或特殊字元。\n- 全正數時的和、乘積、分數限制常具備單調性。\n- 暴力枚舉區間後，發現相鄰區間只差一格。",
        how: "基本骨架：\n\n```cpp\nint left = 0;\nfor (int right = 0; right < n; ++right) {\n  add(nums[right]);           // 右端進，更新摘要\n  while (invalid()) {         // 違反不變式就縮左端\n    remove(nums[left++]);\n  }\n  updateAnswer();             // 依題型計數或更新最值\n}\n```\n\n不變式要先定義：視窗內維護什麼量（和、頻次、種類數、違規數）？何時算合法？答案是在右端驅動時加 `right-left+1`，還是左端驅動時加 `n-right`？",
        mistakes:
          "- 含負數的和通常不能直接滑窗，因為右端擴張後和不一定只變大。\n- 計數前未確認不變式已恢復。\n- 左端驅動與右端驅動的加答案公式混用。\n- 用 `if` 縮左端，但實際需要 `while` 縮到合法。",
        checklist: [
          "我能說出視窗代表哪一段資料嗎？",
          "我知道不變式是「至多」、「至少」還是「固定長度」嗎？",
          "右端加入後，要在什麼條件下縮左端？",
          "答案是加 right-left+1、加 n-right，還是更新最長/最短？",
        ],
      },
    ),
    sub(
      "定長視窗",
      "視窗寬度固定為 k，右進左出維護摘要，每滑一格 O(1) 更新。",
      {
        what: "定長視窗要求每次只看長度剛好為 k 的連續區間。與不定長不同，左端不是「違規才移」，而是「視窗滿 k 後每步都移一格」。相鄰兩個視窗只差最左與最右各一個元素，因此用差量更新而非重算。",
        intuition:
          "暴力對每個起點重算 k 個數是 O(nk)。定長視窗利用「舊視窗 + 新右端 − 舊左端 = 新視窗摘要」這個局部性，把每步壓成 O(1)。",
        when: "- 題目給定固定長度 k，要在所有長度 k 的連續區間中找答案。\n- 答案只跟視窗內某個彙總量有關：總和、平均、某字元數量、是否有重複。\n- 暴力法是「對每個起點重算 k 個數」，相鄰視窗高度重疊。",
        how: "```cpp\nint sum = 0;\nfor (int i = 0; i < n; ++i) {\n  sum += nums[i];              // 右端進\n  if (i >= k) sum -= nums[i-k]; // 視窗滿了，左端出\n  if (i >= k - 1) ans = max(ans, sum); // 剛好滿 k 才結算\n}\n```\n\n四步：① 決定視窗內維護的量；② 右端進元素；③ 長度超過 k 就移左端；④ 在 `i >= k-1` 時讀取答案。頻次、distinct 個數等同理，只是狀態結構不同。",
        mistakes:
          "- 進、出、結算的下標時機 off-by-one。\n- 移出元素後頻次為 0 未刪除鍵，distinct 計數錯誤。\n- 在視窗未滿 k 時就更新答案。\n- 環形陣列忘記取模或複製處理。",
        checklist: [
          "視窗內維護的是總和、頻次還是種類數？",
          "離開的元素下標是 i-k 還是 left 指標？",
          "我是在視窗剛好滿 k 的時刻才結算嗎？",
          "移出元素後，頻次歸零有同步更新 distinct 嗎？",
        ],
      },
    ),
    sub(
      "不定長視窗",
      "視窗長度隨條件伸縮，依「越短越合法」或「越長越合法」決定縮窗時機。",
      {
        what: "不定長視窗不預設寬度，而是讓 `right` 一路擴張，再依題目單調性決定何時移動 `left`。常見兩型：越短越合法（求最長，違規才縮）與越長越合法（求最短，達標就縮）。",
        intuition:
          "單調性是滑窗成立的前提。若縮短一定保持合法、加長才違規，則右擴後只需 while 縮左恢復合法，並在合法時更新最長。若加長一定保持合法、縮短才不達標，則達標後 while 縮左逼出最短，並在縮左前更新答案。",
        when: "- 求最長/最大或最短/最小的連續子陣列，且帶限制條件。\n- 條件對視窗長度具單調性：縮短或加長只朝一個方向改變合法性。\n- 代表題：3（最長無重複）、209（和≥target 最短）、76（最小覆蓋子串）。",
        how: "求最長（越短越合法）：\n\n```cpp\nwhile (invalid()) remove(nums[left++]);\nans = max(ans, right - left + 1);\n```\n\n求最短（越長越合法）：\n\n```cpp\nwhile (valid()) {\n  ans = min(ans, right - left + 1);\n  remove(nums[left++]);\n}\n```\n\n先判斷合法性方向，再決定 while 條件與更新答案的位置。",
        mistakes:
          "- 求最短時把更新答案放在縮左之後，漏算當前合法視窗。\n- 用 if 代替 while，只縮一格未恢復合法。\n- 把越短越合法與越長越合法的模板混用。\n- 含負數時和的單調性失效仍硬套滑窗。",
        checklist: [
          "我的條件是越短越合法還是越長越合法？",
          "縮左用 while 還是 if？",
          "求最短時，更新答案在移出左端之前還是之後？",
          "陣列含負數時，和/乘積還有單調性嗎？",
        ],
      },
    ),
    sub(
      "至多 K",
      "維護「違規量不超過 K」的不變式，常用於替換次數、不同整數種類等限制。",
      {
        what: "「至多 K」表示視窗內某個計數（替換次數、不同整數種類、違規字元數）不能超過 K。維護方式通常是：右端加入後若超標，就 while 縮左端直到回到至多 K。",
        intuition:
          "至多型條件對左端單調：左端越右，視窗越短，越容易滿足「不超過 K」。因此固定右端時，合法左端形成連續區間 `[left, right]`，可一次計入 `right-left+1` 個子陣列。",
        when: "- 最多翻 k 個 0（1004）、至多 k 種不同字元（340）、最多 k 次替換（424）。\n- 題目問「至多」或可作為「恰好」的基礎函數 atMost(K)。\n- 需要數合法子陣列個數，且條件是「不超過某上限」。",
        how: "以「至多 K 種不同整數」為例：\n\n```cpp\nunordered_map<int,int> cnt;\nint left = 0, kinds = 0, ans = 0;\nfor (int right = 0; right < n; ++right) {\n  if (cnt[nums[right]]++ == 0) ++kinds;\n  while (kinds > K) {\n    if (--cnt[nums[left]] == 0) --kinds;\n    ++left;\n  }\n  ans += right - left + 1; // 以 right 結尾的合法段數\n}\n```\n\n不變式：`kinds <= K` 始終成立；超標就縮左端。",
        mistakes:
          "- 把「至多 K 種」與「某字元至多 K 次」的狀態維護搞混。\n- 種類數減到 0 時未 erase 鍵，kinds 不減。\n- K 為 0 或負數時邊界未特判。\n- 計數時窗口尚未恢復合法就加答案。",
        checklist: [
          "我維護的是種類數、次數還是違規量？",
          "超標時 while 縮左直到回到至多 K 嗎？",
          "若數子陣列個數，是否用 right-left+1？",
          "cnt 歸零時有同步更新 kinds 嗎？",
        ],
      },
    ),
    sub(
      "恰好 K",
      "把「恰好 K」改寫成 atMost(K) − atMost(K−1)，避免直接維護「剛好」。",
      {
        what: "「恰好 K」要求條件剛好等於 K（恰好 K 種不同整數、和恰好等於 goal）。直接維護「剛好」很難，因為加長或縮短可能同時跨越合法與非法。標準技巧是：恰好 K = 至多 K − 至多 (K−1)。",
        intuition:
          "所有滿足「至多 K」的集合，扣掉所有滿足「至多 K−1」的集合，剩下的就是「恰好 K」。兩個 atMost 都具左端單調性，各自 O(n) 掃描，總計仍 O(n)。",
        when: "- 992（恰好 K 種不同整數）、930（和恰好 goal）、1248（恰好 k 個奇數）。\n- 題目明確要求「恰好」「正好」「剛好 K」。\n- 直接維護恰好條件會讓左右端移動規則混亂。",
        how: "```cpp\nint exactlyK(vector<int>& nums, int K) {\n  return atMost(nums, K) - atMost(nums, K - 1);\n}\n\nint atMost(vector<int>& nums, int K) {\n  if (K < 0) return 0;\n  // 維護至多 K 的不變式，每步 ans += right-left+1\n}\n```\n\n先寫穩定的 atMost，再相減。奇偶、0/1 計數等也可先轉成至多型。",
        mistakes:
          "- 忘記 atMost(K-1) 在 K=0 時應回傳 0。\n- 兩個 atMost 的狀態定義不一致。\n- 含負數時「和至多 K」對左端不單調，不能滑窗。\n- 直接維護恰好 K 導致邊界多算或少算。",
        checklist: [
          "我能把恰好 K 寫成 atMost(K)-atMost(K-1) 嗎？",
          "atMost 的不變式對左端是否單調？",
          "K=0 或 K-1<0 的邊界處理了嗎？",
          "兩次掃描的狀態更新邏輯完全一致嗎？",
        ],
      },
    ),
    sub(
      "依右端點計數",
      "固定右端點，合法左端形成連續區間，一次加 right−left+1 個子陣列。",
      {
        what: "右端驅動計數的核心：固定 `right`，維護「以 right 為右端的最長（或最短）合法視窗」`[left, right]`。若條件越短越合法，則左端可取 `left..right`，共 `right-left+1` 個合法子陣列。",
        intuition:
          "合法具單調性時，`[left, right]` 合法 ⇒ 所有更短的右端對齊後綴 `[left+1, right]..[right, right]` 也合法。反之 `[left-1, right]` 不合法。因此不必逐一枚舉左端，一次加 `right-left+1`。",
        when: "- 713（乘積小於 K 的子陣列數）、乘積/和/種類數「不超過」上限的計數題。\n- 條件是越短越合法。\n- 問「有多少個合法子陣列」而非最長/最短。",
        how: "```cpp\nfor (int right = 0; right < n; ++right) {\n  add(nums[right]);\n  while (invalid()) remove(nums[left++]);\n  ans += right - left + 1; // 以 right 為右端的段數\n}\n```\n\n與求最長的差別在第三步：合法後不是更新 max，而是累加段數。",
        mistakes:
          "- 在越長越合法的題目誤用 right-left+1，應改用 left。\n- 縮左後未確認合法就計數。\n- 空視窗時 left>right 未防護。\n- 條件不具「越短越合法」卻套用公式。",
        checklist: [
          "我數的是「以 right 為右端」的合法段嗎？",
          "條件真的是越短越合法嗎？",
          "縮左後視窗已合法才加 right-left+1 嗎？",
          "與左端驅動計數的公式我分清楚了嗎？",
        ],
      },
    ),
    sub(
      "左端驅動視窗",
      "固定左端點，右端達標後更右都達標，一次加上右側剩餘數量。",
      {
        what: "左端驅動與右端驅動對稱：固定 `left`，找出最小（或最大）合法 `right`。若條件越長越合法，一旦 `[left, right]` 達標，則 `[left, right]..[left, n-1]` 都合法，可一次加 `n-right`（或 `n-left` 依題型）個子陣列。",
        intuition:
          "2516（每種字元至少取 K 個）等題：左端固定後，右端單調擴張直到達標，之後更右的右端都仍達標。這讓每個左端只需找一次臨界右端，而非枚舉所有右端。",
        when: "- 條件是越長越合法：包含足夠元素、覆蓋目標、最大值出現至少 K 次。\n- 1358、2962 等「越長越合法」的計數題用 `ans += left`。\n- 左端固定後，達標右端形成連續後綴。",
        how: "```cpp\nfor (int left = 0; left < n; ++left) {\n  while (right < n && !valid()) expandRight();\n  if (!valid()) break;\n  ans += n - right; // 或依題型調整\n  shrinkLeftState();\n}\n```\n\n也可用右端主迴圈、達標後縮左到最短，此時 `ans += left`（左端可取 0..left-1）。",
        mistakes:
          "- 與右端驅動的 right-left+1 混用。\n- 縮左後 right 指標未正確維護，漏掉或重複計數。\n- 達標條件判斷錯誤，導致 n-right 多算。\n- 左端移動時未同步更新視窗狀態。",
        checklist: [
          "條件是越長越合法嗎？",
          "固定左端後，達標右端之後都合法嗎？",
          "我加的是 n-right 還是 left？",
          "左端移動時視窗狀態有正確更新嗎？",
        ],
      },
    ),
    sub(
      "頻次視窗",
      "用 map 或陣列維護視窗內各值的出現次數，支援比對、覆蓋與種類統計。",
      {
        what: "頻次視窗在滑動視窗基礎上，用 `cnt[value]` 記錄視窗內每個值（或字元）的出現次數。可用於：判斷無重複、比對異位詞、統計不同種類數、維護覆蓋目標字串所需字元。",
        intuition:
          "加入元素時 `cnt[x]++`，移出時 `cnt[x]--`。種類數在 `cnt[x]` 從 0→1 時 +1、從 1→0 時 −1。覆蓋類題用 `missing` 或 `formed` 追蹤還缺幾種字元才達標，避免每次比對整張表。",
        when: "- 438/567（異位詞/排列）、76（最小覆蓋子串）、3（無重複字元）。\n- 合法性取決於「每種字元各幾個」而非單一數值。\n- 需要維護視窗內 distinct 個數或與目標頻次比對。",
        how: "```cpp\nvector<int> cnt(256);\nint distinct = 0;\nvoid add(char c) {\n  if (cnt[c]++ == 0) ++distinct;\n}\nvoid remove(char c) {\n  if (--cnt[c] == 0) --distinct;\n}\n```\n\n字元集小用陣列，值域大用 `unordered_map`。OR 視窗需維護每個 bit 的頻次，不能直接減掉 OR 值。",
        mistakes:
          "- cnt 歸零未刪鍵，distinct 或 kinds 偏大。\n- 比對異位詞時視窗未滿就結算。\n- OR/AND 視窗用加減法維護位元聚合值。\n- 字元集大小選錯（應 128 卻用 26）。",
        checklist: [
          "頻次用陣列還是 map？",
          "種類數在 0↔1 轉換時有同步更新嗎？",
          "覆蓋類題用 missing/formed 簡化比對了嗎？",
          "移出元素時頻次歸零的處理正確嗎？",
        ],
      },
    ),
  ],
  93006: [
    sub(
      "前綴和與雜湊表",
      "把子陣列和改寫成兩個前綴相減，用雜湊表快速查找以前的前綴。",
      {
        what: "前綴和 `prefix[i]` 表示前 i 個元素的總和。子陣列 `i..j` 的和等於 `prefix[j+1] - prefix[i]`。因此「找子陣列和等於 target」變成「找以前是否有 prefix 等於 `current - target`」。雜湊表在 O(1) 平均時間回答這個查詢。",
        intuition:
          "暴力枚舉左右端是 O(n²)。固定右端時，合法左端只取決於以前出現過的前綴值。把「配對」交給雜湊表，掃描一遍即可。",
        when: "- 子陣列和可正可負，滑窗失去單調性。\n- 要求和等於 K、和能被 K 整除、奇偶數量剛好 K。\n- 需要統計以前有多少狀態與目前狀態配對。",
        how: "```cpp\nunordered_map<long long, long long> freq;\nfreq[0] = 1;\nlong long prefix = 0, ans = 0;\nfor (int x : nums) {\n  prefix += x;\n  ans += freq[prefix - target];\n  ++freq[prefix];\n}\n```\n\n關鍵順序：先查 `prefix - target`，再把目前 prefix 加入 map。`freq[0]=1` 處理從頭開始的子陣列。",
        mistakes:
          "- 忘記空前綴 freq[0]=1。\n- 查詢與插入順序反了，把空子陣列算進去。\n- 答案用 int 但前綴和需 long long。\n- map 存的是頻次、最早下標還是最優值，語意搞混。",
        checklist: [
          "我能寫出子陣列條件對應的 prefix[j]-prefix[i] 嗎？",
          "固定右端時，需要查以前的哪個前綴？",
          "先查詢再插入，且 freq[0] 初始化了嗎？",
          "map 裡存頻次、下標還是多狀態？",
        ],
      },
    ),
    sub("前綴頻次", "用 map 記錄每個前綴值出現幾次，支援計數型子陣列查詢。", {
      what: "前綴頻次在掃描時維護 `freq[prefix]`：每遇到一個新前綴，先查以前相同或互補的前綴出現幾次，再累加答案，最後 `freq[prefix]++`。適合「有多少子陣列和等於 K」這類純計數題。",
      intuition:
        "每個右端點對應的合法左端個數 = 以前 `prefix - target` 的出現次數。頻次表把「找所有匹配左端」壓成 O(1) 查詢。",
      when: "- 560（和為 K 的子陣列）、974（和可被 K 整除，配合模數前綴）。\n- 問「有多少個」而非「最長/最短」。\n- 同一前綴可能出現多次，需累加頻次而非只記一次。",
      how: "```cpp\nfor (int x : nums) {\n  prefix += x;\n  ans += freq[prefix - K];\n  ++freq[prefix];\n}\n```\n\n若需「最早下標」或「最小前綴」，改存 `map[prefix] = index` 並用 min/max 更新。",
      mistakes:
        "- 只記 0/1 存在性，漏算重複前綴造成的多個子陣列。\n- 初始化 freq[0]=1 遺漏。\n- 查詢目標寫成 prefix+K 而非 prefix-K。\n- 與「存最早下標」的變形混用。",
      checklist: [
        "這題要計數還是找位置？",
        "重複前綴需要累加頻次嗎？",
        "查詢鍵是 prefix-target 嗎？",
        "freq[0] 初始化為 1 了嗎？",
      ],
    }),
    sub("模數前綴", "兩個前綴除以 k 餘數相同，其差值可被 k 整除。", {
      what: "若題目問「子陣列和能被 k 整除」，等價於找兩個前綴 `prefix[j]` 與 `prefix[i]` 使得 `(prefix[j] - prefix[i]) % k == 0`，即兩者除以 k 的餘數相同。維護 `freq[prefix % k]` 即可計數。",
      intuition:
        "模運算把無限多前綴值壓到 k 個餘數類。同餘的前綴兩兩配對都能形成合法子陣列。負數取模要用 `((prefix % k) + k) % k`。",
      when: "- 974（和可被 K 整除的子陣列）、1590（使陣列和可被 K 整除的最小子陣列）。\n- 題目出現「整除」「模 k」「同餘」。\n- 和的絕對值很大，但餘數空間只有 k。",
      how: "```cpp\nint rem = ((prefix % k) + k) % k;\nans += freq[rem];\n++freq[rem];\n```\n\n初始化 `freq[0]=1` 處理從頭開始、餘數為 0 的子陣列。",
      mistakes:
        "- C++ 負數取模結果仍為負，未正規化。\n- 忘記空前綴餘數 0。\n- 把「和為 k 的倍數」與「和等於 k」搞混。\n- k=0 未特判。",
      checklist: [
        "餘數正規化為非負了嗎？",
        "freq[0] 代表空前綴餘數 0 嗎？",
        "題目要整除還是等於 K？",
        "k=0 或 k=1 的邊界處理了嗎？",
      ],
    }),
    sub("計數差分", "把奇偶、字元類型等轉成 +1/0/-1 差分，再配對前綴。", {
      what: "計數差分把複雜條件編碼成數值序列：奇數→1、偶數→0；某字元→+1、另一字元→-1。子陣列滿足「剛好 k 個奇數」等條件時，對應差分前綴的特定值，可用前綴頻次或 atMost 相減處理。",
      intuition:
        "把「數個數」變成「和前綴相等」。1248 把奇數當 1、偶數當 0，恰好 k 個奇數 ⇔ 子陣列和為 k。平衡 0/1 字串則用 +1/-1 使合法子陣列和前綴為 0。",
      when: "- 1248（優美子陣列）、525（連續陣列）、平衡子陣列問題。\n- 條件是「某類元素剛好/至多 k 個」。\n- 直接數字元種類太複雜，可編碼成數值陣列。",
      how: "```cpp\n// 奇數計 1，偶數計 0\nint val = (nums[i] & 1) ? 1 : 0;\nprefix += val;\n// 恰好 k 個奇數：atMost(k) - atMost(k-1)\n```\n\n或 +1/-1 編碼後，找 prefix[j]==prefix[i] 的配對。",
      mistakes:
        "- 編碼規則與題意不一致（奇偶、0/1 搞反）。\n- 恰好 k 個未轉成 atMost 差分。\n- 全 0 差分陣列的空前綴處理錯誤。\n- 多種字元編碼時溢位或狀態空間過大。",
      checklist: [
        "我把條件編碼成什麼數值序列？",
        "恰好 k 個是否用 atMost 差分？",
        "編碼後仍用前綴和+雜湊嗎？",
        "空前綴與全零情況處理了嗎？",
      ],
    }),
    sub(
      "子陣列和等於 K",
      "經典前綴和應用：統計或判斷是否存在和為 K 的連續子陣列。",
      {
        what: "子陣列和等於 K 是前綴和+雜湊表的原型題。對每個右端點，查以前有多少前綴等於 `currentPrefix - K`，累加即得子陣列個數。若只問是否存在，查到一次即可回傳 true。",
        intuition:
          "`prefix[j] - prefix[i] = K` ⇔ `prefix[i] = prefix[j] - K`。右端掃描時，歷史前綴表告訴你有多少個合法左端。",
        when: "- 560（和為 K 的子陣列）、523（連續子陣列和）。\n- 陣列含負數，滑動視窗不適用。\n- 問計數、是否存在、或最長/最短（後者可能需改存下標）。",
        how: "```cpp\nlong long subarraySum(vector<int>& nums, int k) {\n  unordered_map<long long, int> freq{{0, 1}};\n  long long prefix = 0, ans = 0;\n  for (int x : nums) {\n    prefix += x;\n    if (freq.count(prefix - k)) ans += freq[prefix - k];\n    ++freq[prefix];\n  }\n  return ans;\n}\n```",
        mistakes:
          "- 用滑動視窗處理含負數陣列。\n- 前綴和未用 long long。\n- 找最長時誤用頻次而非最早下標。\n- 空子陣列是否允許未釐清。",
        checklist: [
          "陣列有負數嗎？還能用滑窗嗎？",
          "要計數還是找最長/最短？",
          "前綴和用 long long 了嗎？",
          "freq[0]=1 處理從頭開始的子陣列了嗎？",
        ],
      },
    ),
    sub("二維前綴和", "用四塊矩形相加相減，O(1) 查詢任意子矩陣和。", {
      what: "二維前綴 `P[r][c]` 表示從 (0,0) 到 (r-1,c-1) 的矩形和（常用 +1 偏移）。子矩陣 (r1,c1) 到 (r2,c2) 的和：\n`P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]`。",
      intuition:
        "一維前綴是「到目前為止」；二維是「到目前矩形為止」。查詢時用大矩形減掉三塊多算的部分，加回重複減去的角落。",
      when: "- 304（二維區域和檢索）、1277（統計全為 1 的正方形子矩陣）。\n- 矩陣中反覆查詢矩形和。\n- 固定矩形大小滑動時，可用二維前綴 O(1) 取每個窗口和。",
      how: "```cpp\n// 建表：P[i+1][j+1] = grid[i][j] + P[i][j+1] + P[i+1][j] - P[i][j]\n// 查詢 (r1,c1,r2,c2)：\nint sum = P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1];\n```\n\n注意 +1 偏移與閉區間邊界。",
      mistakes:
        "- +1 偏移與矩形邊界搞混。\n- 加減四塊時符號錯誤。\n- 建表與查詢的座標系不一致。\n- 未考慮空矩陣或單格邊界。",
      checklist: [
        "建表與查詢都用 +1 偏移了嗎？",
        "四塊相加相減的符號正確嗎？",
        "矩形是閉區間 [r1,c1]..[r2,c2] 嗎？",
        "多次查詢時建表只做一次了嗎？",
      ],
    }),
  ],
  93007: [
    sub(
      "答案二分搜尋",
      "不直接構造答案，而是二分候選值並用 check(x) 判斷可行性。",
      {
        what: "答案二分搜尋用在答案本身是一個數值，且可行性隨候選值單調變化的問題。不猜具體構造，而是在答案空間 `[left, right]` 二分，每次用 `check(mid)` 判斷 mid 是否可行。",
        intuition:
          "若 x 可行則所有更寬鬆（或更嚴格）的值也可行，答案空間就有單調性。二分負責找邊界；真正的難點是設計正確的 check(x)。",
        when: "- 最小化最大值、最大化最小值、最少時間、最小速度、最小容量。\n- 直接構造最佳值困難，但驗證某值很容易。\n- 限制值在大範圍整數內，O(log answer × check) 可接受。",
        how: "```cpp\n// 最小化最大值：找第一個可行值\nwhile (left < right) {\n  long long mid = left + (right - left) / 2;\n  if (check(mid)) right = mid;\n  else left = mid + 1;\n}\n\n// 最大化最小值：找最後一個可行值\nwhile (left < right) {\n  long long mid = left + (right - left + 1) / 2;\n  if (check(mid)) left = mid;\n  else right = mid - 1;\n}\n```",
        mistakes:
          "- check(x) 沒有單調性卻硬二分。\n- 右邊界不包含答案。\n- first true 與 last true 的 mid 偏移混用。\n- 計數相乘忘記 long long。",
        checklist: [
          "候選 x 變大時，題目更容易還是更難？",
          "我要找 first true 還是 last true？",
          "check(x) 只回傳可行/不可行，不偷算答案嗎？",
          "left/right 保證包住答案嗎？",
        ],
      },
    ),
    sub(
      "最小化最大值",
      "找最小的 x 使得「最大某量 ≤ x」成立，check 時 x 越大越容易。",
      {
        what: "最小化最大值問：在所有可行方案中，讓「最壞情況」盡量小。例如「把陣列分成 m 段，最小化各段和的最大值」（410）。候選容量越大越容易切分，因此找第一個可行的 x。",
        intuition:
          "x 越大，限制越寬鬆，check 越容易通過。答案是最小的可行 x，用 first true 二分。",
        when: "- 410（分割陣列的最大值）、875（愛吃香蕉的珂珂）、1760（合併果子）。\n- 題目關鍵字：最小化最大值、最少天數完成、最小容量。\n- 驗證「用限制 x 能否完成」比直接分配容易。",
        how: "```cpp\nbool check(long long cap) {\n  // 貪心或計數：在限制 cap 下能否完成\n  return feasible;\n}\nlong long ans = firstTrue(lo, hi);\n```\n\ncheck 常是：排序後能放就放、超過 cap 就開新組。",
        mistakes:
          "- 用 last true 模板找最小化最大值。\n- check 的 cap 語意與題目不一致。\n- 上界 hi 設太小，不包含答案。\n- check 內部貪心不正確。",
        checklist: [
          "x 變大時 check 更容易通過嗎？",
          "我用 first true 模板了嗎？",
          "check 的語意是「最大不超過 x」嗎？",
          "hi 上界足夠大嗎？",
        ],
      },
    ),
    sub(
      "最大化最小值",
      "找最大的 x 使得「最小某量 ≥ x」成立，check 時 x 越大越難。",
      {
        what: "最大化最小值問：讓「最差的那一項」盡量大。例如「在陣列中放 k 個球，最大化相鄰球的最小距離」（1552）。距離 x 越大越難放置，找最後一個可行的 x。",
        intuition:
          "x 越大，要求越嚴格，check 越難通過。答案是最大的可行 x，用 last true 二分。",
        when: "- 1552（磁鐵距離）、1482（製作 m 束花的最少天數的對稱題）、2517（加油站的對稱）。\n- 最大化最小值、最大距離、最大速度下限。\n- 驗證「能否達到至少 x」比直接構造容易。",
        how: "```cpp\nbool check(long long x) {\n  // 驗證能否使最小值 >= x\n  return feasible;\n}\nlong long ans = lastTrue(lo, hi);\n```\n\ncheck 常是貪心放置：間隔至少 x 時最多能放幾個。",
        mistakes:
          "- 用 first true 模板找最大化最小值。\n- mid 偏移寫成 `(right-left)/2` 而非 `(right-left+1)/2`。\n- check 把「至少 x」寫成「至多 x」。\n- 邊界 lo 不是最小可能答案。",
        checklist: [
          "x 變大時 check 更難通過嗎？",
          "我用 last true 模板了嗎？",
          "mid 偏移用 (right-left+1)/2 了嗎？",
          "check 驗證的是「最小值 ≥ x」嗎？",
        ],
      },
    ),
    sub(
      "可行性檢查",
      "check(x) 是答案二分的核心：用一次掃描或貪心判斷限制 x 下能否完成。",
      {
        what: "可行性檢查 `check(x)` 回答：「若答案上限（或下限）是 x，問題能否解？」它必須只依賴 x 與輸入，不偷算最終答案，且對 x 具單調性。",
        intuition:
          "二分的價值在於把「找最優」變成「判斷可行」。check 的品質決定整題正確性與複雜度。好的 check 通常是 O(n) 或 O(n log n) 掃描。",
        when: "- 所有答案二分題都依賴 check。\n- 驗證比構造簡單：能否在 x 天完成、能否用 x 容量運完、能否使距離至少 x。",
        how: "設計 check 的步驟：\n1. 明確 x 的語意（最大段和？最小間距？）。\n2. 用貪心/計數模擬：在限制 x 下能完成多少？\n3. 回傳 true/false，不更新全局最優。\n\n```cpp\nbool check(int x) {\n  int groups = 1;\n  long long cur = 0;\n  for (int v : nums) {\n    if (cur + v > x) { ++groups; cur = 0; }\n    cur += v;\n  }\n  return groups <= m;\n}\n```",
        mistakes:
          "- check 沒有單調性。\n- check 內部做了不該做的全局最優化。\n- 複雜度太高導致 TLE。\n- 邊界條件（空輸入、x=0）未處理。",
        checklist: [
          "x 的語意我說得清楚嗎？",
          "check 對 x 單調嗎？",
          "check 只回傳 bool，不偷算答案嗎？",
          "check 複雜度能承受 log 次呼叫嗎？",
        ],
      },
    ),
    sub(
      "貪心檢查",
      "check(x) 內用排序後能放就放、超過限制就開新組的貪心策略。",
      {
        what: "貪心檢查在 check(x) 中：將物件排序後，依序處理，能放入目前組就放，否則開新組或判定失敗。常見於分割、配對、排程類可行性驗證。",
        intuition:
          "若問題有「按某順序處理，局部最優不影響可行性判斷」的結構，check 可用貪心 O(n log n)。排序目的要清楚：按右端點、按截止時間、按大小等。",
        when: "- 410、1482、1751 等 check 需排序後貪心放置。\n- 驗證「能否分成不超過 m 段且每段 ≤ x」。\n- 會議室、任務排程的可行性。",
        how: "```cpp\nbool check(long long x) {\n  sort(items.begin(), items.end(), byDeadline);\n  long long cur = 0;\n  for (auto& it : items) {\n    if (cur + it.cost > x) return false; // 或開新組\n    cur += it.cost;\n  }\n  return true;\n}\n```\n\n排序鍵必須有交換論證或標準貪心理由。",
        mistakes:
          "- 排序鍵選錯，貪心不正確。\n- 開新組的條件與題意不符。\n- 忘記排序導致 check 錯誤。\n- 把貪心檢查當成直接求最優解。",
        checklist: [
          "check 內排序的鍵是什麼？為什麼正確？",
          "超過限制時開新組還是直接失敗？",
          "貪心順序與題目約束一致嗎？",
          "這只是 check，不是最終構造嗎？",
        ],
      },
    ),
    sub(
      "計數型檢查",
      "check(x) 內計算在限制 x 下最多能完成多少趟、多少件、多少合金。",
      {
        what: "計數型檢查不只做 yes/no，而是在 check 內計算「在時間/容量/速度 x 下最多能完成多少」。再與目標比較。也常見於純計數後與閾值比較的 bool 回傳。",
        intuition:
          "1870（運貨）、2187（完成旅途的最少時間）等：給定速度 x，計算能在時間 T 內完成多少件，再判斷是否 ≥ 需求。把連續答案離散化成計數問題。",
        when: "- 最少時間內能完成多少、給定速度能運多少。\n- check 需累加趟數、件數、天數。\n- 乘法或除法可能溢位，需 long long。",
        how: "```cpp\nbool check(long long speed) {\n  long long done = 0;\n  for (int t : times) {\n    done += speed / t; // 或 ceil 公式\n    if (done >= need) return true;\n  }\n  return done >= need;\n}\n```\n\n注意整除、上取整與溢位。",
        mistakes:
          "- 計數公式錯誤（該用 ceil 卻用 floor）。\n- 累加溢位未用 long long。\n- 提前 break 條件錯誤。\n- 把計數結果當答案而非比較用。",
        checklist: [
          "check 內計數的是趟數、件數還是天數？",
          "整除/上取整公式正確嗎？",
          "用 long long 防溢位了嗎？",
          "計數結果與目標比較後才回傳 bool 嗎？",
        ],
      },
    ),
  ],
  93008: [
    sub(
      "堆積貪心",
      "用 priority_queue 隨時取目前最大或最小，支援每步最佳選擇。",
      {
        what: "堆積貪心適合「每一步都要從目前候選中取最大或最小」的題目。`priority_queue` 讓插入與取頂都是 O(log n)，適合動態候選集合。",
        intuition:
          "若未來只在乎目前候選中的極值，堆積比每次掃描 O(n) 更優。貪心正確性常靠交換論證：把最好資源留給最緊迫需求，或先處理最高優先級。",
        when: "- 反覆取目前最大/最小。\n- 2530（最大運行時間）、871（最低加油）、1642（最便宜書）。\n- 候選動態加入，需快速取極值。",
        how: "```cpp\npriority_queue<int> best; // 最大堆\nfor (auto& event : events) {\n  if (canAdd(event)) best.push(value(event));\n  if (needHelp()) {\n    if (best.empty()) return fail;\n    use(best.top()); best.pop();\n  }\n}\n```\n\n明確堆裡放的是候選、已選還是可反悔項。",
        mistakes:
          "- min-heap/max-heap 選反。\n- 堆中元素語意不清。\n- 該用堆卻每次掃描。\n- 貪心無交換論證只是看起來合理。",
        checklist: [
          "我需要每次取最大還是最小？",
          "堆裡保存候選還是已分配資源？",
          "何時 push、何時 pop？",
          "貪心有單調或交換理由嗎？",
        ],
      },
    ),
    sub("先拿再反悔", "先接受所有候選，超過限制時從堆中踢掉最不划算者。", {
      what: "先拿再反悔：先把可能需要的東西都選進來，若超過容量/數量限制，就從已選集合中移除「最差」的那個。堆積維護已選集合，方便 O(log n) 踢掉極值。",
      intuition:
        "若「多選了可以事後刪最差的」且刪最差不會讓後續更差，這個貪心成立。例如選最多 k 個任務，超過就踢掉利潤最小的。",
      when: "- 2163（使數字非遞減的最少操作）、買賣、選任務超過 k 個。\n- 限制是「最多選 k 個」而非「恰好 k 個」。\n- 事後移除最差比事前判斷容易。",
      how: "```cpp\npriority_queue<int, vector<int>, greater<int>> kept; // 最小堆存已選\nlong long sum = 0;\nfor (int x : profits) {\n  kept.push(x); sum += x;\n  if ((int)kept.size() > k) {\n    sum -= kept.top(); kept.pop();\n  }\n}\n```",
      mistakes:
        "- 踢錯極值（該踢最大卻踢最小）。\n- 堆大小與 k 的關係搞反。\n- 先拿再反悔用於不能事後刪的約束。\n- 忘記同步更新累加和。",
      checklist: [
        "超過限制時踢的是最大還是最小？",
        "先拿再反悔的交換論證成立嗎？",
        "堆存已選集合，大小不超過 k 嗎？",
        "踢掉後有同步更新摘要（和、計數）嗎？",
      ],
    }),
    sub("必要時才用昂貴資源", "先用便宜方案，撐不住才從堆中取最佳補救。", {
      what: "這類貪心把資源分級：便宜資源先用，只有當便宜的不夠時，才從堆中取最優的昂貴資源補上。1642 買書：先用已有副本，不夠才買最便宜的新書。",
      intuition:
        "昂貴資源留到真正需要時才用，不會浪費在還能用便宜方案解決的時刻。堆積保存「目前可用的最佳補救選項」。",
      when: "- 1642、630（課程表 III）、2402（會議室 III）。\n- 多種資源，有優先使用順序。\n- 每步先消耗免費/便宜，不足再取堆頂。",
      how: "```cpp\nfor (auto& task : sortedByDeadline) {\n  if (cheapEnough(task)) useCheap(task);\n  else if (!heap.empty()) { use(heap.top()); heap.pop(); }\n  else return fail;\n}\n```\n\n排序順序（如按截止時間）常是貪心正確性的關鍵。",
      mistakes:
        "- 過早使用昂貴資源。\n- 堆中候選未按時機更新。\n- 排序順序錯誤導致貪心失效。\n- 便宜資源條件判斷錯誤。",
      checklist: [
        "便宜與昂貴資源的定義清楚嗎？",
        "是否先用便宜，不夠才 pop 堆？",
        "事件排序順序有貪心依據嗎？",
        "堆中候選何時加入？",
      ],
    }),
    sub(
      "延遲刪除",
      "heap 不支援任意刪除時，允許舊資料留在堆中，查詢前驗證堆頂。",
      {
        what: "標準 heap 只能刪堆頂。若元素會被更新或刪除，可把新值 push 進去，舊值留在堆中。查詢時 while 堆頂已過期（與權威狀態不符）就 pop，直到堆頂有效。",
        intuition:
          "權威狀態（map 存目前真實值）是真相；堆是索引。堆頂可能 stale，用 `current[id] != heap.top().value` 判斷並彈出。攤還分析下每個元素最多進出堆常數次。",
        when: "- 分數會更新、任務會取消、價格會變。\n- 981（最近七天價格）、2034（股票價格波動）。\n- 需要堆的極值查詢但資料會變。",
        how: "```cpp\nwhile (!pq.empty() && stale(pq.top())) pq.pop();\nreturn pq.empty() ? defaultVal : pq.top();\n```\n\n更新時：`current[id]=newVal; pq.push({newVal, id});`",
        mistakes:
          "- 沒有權威狀態，無法判斷 stale。\n- 從不清理堆，記憶體爆炸。\n- stale 判斷條件寫錯。\n- 只 push 不驗證，取到過期答案。",
        checklist: [
          "權威狀態（map）定義了嗎？",
          "堆頂過期時 while pop 了嗎？",
          "更新時 push 新值而非改堆內舊值嗎？",
          "stale 判斷與權威狀態一致嗎？",
        ],
      },
    ),
    sub("雙堆積", "一個堆放可用資源，另一個放忙碌資源，模擬分配與釋放。", {
      what: "雙堆積用兩個堆（或堆+集合）分別維護兩類狀態：例如「可用伺服器」與「忙碌伺服器」、「待處理任務」與「進行中任務」。事件到來時在兩堆間轉移。",
      intuition:
        "把狀態空間切成兩半，每半用堆維護極值。釋放時從忙碌堆移到可用堆；分配時從可用堆取最優。適合模擬排程與資源池。",
      when: "- 2402（會議室 III）、1882（追趕王國）。\n- 資源會從忙碌變可用（時間到期）。\n- 需在兩種集合間轉移並取極值。",
      how: "```cpp\npriority_queue<int> available;   // 可用，取最大編號\npriority_queue<int, vector<int>, greater<int>> busy; // 忙碌，按釋放時間\n// 時間到：busy.top 釋放 → push 到 available\n// 分配：從 available 取頂\n```",
      mistakes:
        "- 兩堆語意搞混。\n- 釋放時間未排序，busy 堆鍵錯誤。\n- 轉移時未從一個堆刪除就加入另一個。\n- 時間事件處理順序錯誤。",
      checklist: [
        "兩個堆各代表什麼狀態？",
        "忙碌→可用 的觸發時機是什麼？",
        "堆的排序鍵（時間、編號）正確嗎？",
        "分配時從哪個堆取？",
      ],
    }),
    sub("優先級排程", "按時間排序事件，用堆決定下一個執行者或處理順序。", {
      what: "優先級排程：把所有事件（到達時間、截止時間）排序後掃描，用堆維護「目前可執行的候選」，每次取優先級最高（或截止最近）的執行。",
      intuition:
        "時間單向前進，堆保證在任意時刻快速取最該處理的任務。經典模型：會議室、任務調度、CPU 排程。",
      when: "- 2530、1834（單線程 CPU）、1705（吃香蕉的最少時間）。\n- 任務有到達時間、處理時間、優先級。\n- 需按時間模擬並動態選下一個。",
      how: "```cpp\nsort(events);\npriority_queue<Task> pq;\nfor (auto& e : events) {\n  advanceTime(e.time);\n  pq.push(e);\n  auto t = pq.top(); pq.pop();\n  process(t);\n}\n```\n\n堆鍵可能是處理時間、利潤、截止時間。",
      mistakes:
        "- 事件未按時間排序。\n- 堆鍵與優先級定義不符。\n- 時間前進時未釋放已完成任務。\n- 同時多個事件時處理順序錯。",
      checklist: [
        "事件按什麼時間排序？",
        "堆的優先級鍵是什麼？",
        "時間前進時有釋放/加入候選嗎？",
        "模擬時鐘與事件順序一致嗎？",
      ],
    }),
  ],
  93009: [
    sub("區間與掃描線", "把區間端點排序成事件，依序維護覆蓋數或活躍集合。", {
      what: "區間題的第一步通常是排序。掃描線把每個區間 [l,r] 拆成事件 (l, +1) 與 (r+1, -1)，按座標排序後掃過，維護「目前活躍區間數」或覆蓋狀態。",
      intuition:
        "排序後區間關係變局部：下一個區間只需與目前合併段、活躍集合或最早結束者互動。差分事件把區間加減轉成端點變化。",
      when: "- 會議、預訂、工作日、天數覆蓋、最少分組。\n- 需要最大同時存在數、合併後長度、未覆蓋區間。\n- 查詢點與區間配對。",
      how: "```cpp\nvector<pair<int,int>> events;\nfor (auto [l,r] : intervals) {\n  events.push_back({l, 1});\n  events.push_back({r+1, -1});\n}\nsort(events.begin(), events.end());\nint active = 0, best = 0;\nfor (auto [x,d] : events) {\n  active += d;\n  best = max(best, active);\n}\n```",
      mistakes:
        "- 閉區間與半開區間混淆。\n- 同一座標 start/end 處理順序錯。\n- 按錯端點排序。\n- r+1 溢位未用 long long。",
      checklist: [
        "這題是合併、數重疊還是回答查詢？",
        "端點是閉區間還是半開區間？",
        "按左端、右端還是拆事件排序？",
        "需要活躍集合或座標壓縮嗎？",
      ],
    }),
    sub("合併區間", "按左端點排序，相鄰重疊區間合併成一段。", {
      what: "合併區間：將 intervals 按 left 排序，遍歷時若 next.left <= current.right 就合併（更新 right = max(right, next.right)），否則把 current 加入答案並開新段。",
      intuition:
        "排序後只需比較目前合併段與下一個區間是否重疊，不需回頭。O(n log n) 排序 + O(n) 掃描。",
      when: "- 56（合併區間）、57（插入區間）、759（員工空閒時間）。\n- 輸出合併後的不重疊區間列表。\n- 重疊定義：next.left <= cur.right（閉區間）。",
      how: "```cpp\nsort(intervals.begin(), intervals.end());\nvector<vector<int>> ans;\nfor (auto& in : intervals) {\n  if (ans.empty() || in[0] > ans.back()[1]) ans.push_back(in);\n  else ans.back()[1] = max(ans.back()[1], in[1]);\n}\n```",
      mistakes:
        "- 未排序就合併。\n- 重疊判斷用 < 而非 <=。\n- 合併時只更新 right 未取 max。\n- 半開區間用閉區間公式。",
      checklist: [
        "按 left 排序了嗎？",
        "重疊條件是 next.left <= cur.right 嗎？",
        "合併時 right 取 max 了嗎？",
        "區間是閉還是半開？",
      ],
    }),
    sub("會議室模型", "最少房間數等於最大重疊區間數，可用堆或差分事件。", {
      what: "會議室模型：給定多個 [start, end)，求同時進行最多幾個會議（最少房間數）。按 start 排序，用 min-heap 存各房間的結束時間；新會議來時若最早結束 ≤ start 就重用，否則開新房。",
      intuition:
        "最大重疊數 = 最少房間數。堆維護「目前佔用房間的結束時間」，只關心最早釋放的那間。",
      when: "- 253（會議室 II）、1094（拼车）、2406（將區間分為最少組數）。\n- 問最少資源數、最大同時進行數。\n- 區間有開始與結束時間。",
      how: "```cpp\nsort(intervals.begin(), intervals.end());\npriority_queue<int, vector<int>, greater<int>> ends;\nfor (auto& iv : intervals) {\n  if (!ends.empty() && ends.top() <= iv[0]) ends.pop();\n  ends.push(iv[1]);\n}\nreturn ends.size();\n```",
      mistakes:
        "- 用 max-heap 而非 min-heap 存結束時間。\n- 重用條件寫成 < 而非 <=。\n- 未按 start 排序。\n- 把「分組」與「房間數」模型搞混。",
      checklist: [
        "堆存的是結束時間嗎？",
        "重用條件是 ends.top() <= start 嗎？",
        "按 start 排序了嗎？",
        "答案是堆的大小（最大重疊）嗎？",
      ],
    }),
    sub("差分事件", "閉區間 [l,r] 在 l 處 +1、r+1 處 -1，掃描得各點覆蓋數。", {
      what: "差分事件把區間修改轉成端點增量：對 [l,r] 覆蓋 +1，在 l 加 1、在 r+1 減 1。排序掃描後，前綴和即為該點覆蓋數。",
      intuition:
        "區間對全局的影響只在邊界發生。掃描線掃過座標軸，active 變化只在事件點。適合大量區間修改、查詢覆蓋。",
      when: "- 1094、1109（航班訂位統計）、1453（最大連續子陣列）。\n- 需要每個位置的覆蓋次數或最大覆蓋。\n- 區間加減操作可拆成兩個事件。",
      how: "```cpp\nmap<long long, int> diff;\nfor (auto [l,r] : intervals) {\n  diff[l]++;\n  diff[r+1]--;\n}\nlong long x = 0, best = 0;\nfor (auto [coord, delta] : diff) {\n  x += delta;\n  best = max(best, x);\n}\n```",
      mistakes:
        "- 閉區間忘記 r+1 處 -1。\n- 同一座標多事件未累加 delta。\n- 用陣列差分但座標範圍太大未壓縮。\n- 掃描順序未排序。",
      checklist: [
        "閉區間在 r+1 減 1 了嗎？",
        "事件按座標排序了嗎？",
        "座標很大時要壓縮嗎？",
        "同一點多個 delta 合併了嗎？",
      ],
    }),
    sub("活躍集合", "掃描時維護目前覆蓋查詢點的區間集合，支援取最小右端等。", {
      what: "活躍集合在掃描過程中維護「目前仍覆蓋某點的區間」。常用 multiset、set 或堆，支援查詢最小右端、最大左端、第 k 小等。1851 查詢時需知覆蓋 p 的最小區間。",
      intuition:
        "事件到來時加入/移除區間；查詢時從活躍集合取極值。比每次掃全部區間更高效。",
      when: "- 1851（每個查詢的最小間隔）、2589（完成所有任務的最少時間）。\n- 掃描中需知道「目前活著的區間」的統計。\n- 區間動態加入與過期。",
      how: "```cpp\nmultiset<int> activeEnds;\nfor (auto& event : sortedEvents) {\n  while (!activeEnds.empty() && *activeEnds.begin() < event.time)\n    activeEnds.erase(activeEnds.begin());\n  if (event.type == ADD) activeEnds.insert(event.end);\n  if (event.type == QUERY) ans = *activeEnds.begin();\n}\n```",
      mistakes:
        "- 過期區間未從集合移除。\n- multiset erase 用法錯誤（應 erase(iterator)）。\n- 活躍條件（半開/閉）搞錯。\n- 查詢時集合為空未處理。",
      checklist: [
        "何時加入、何時移除區間？",
        "過期判斷用 end < now 還是 <=？",
        "集合存的是右端、左端還是整段？",
        "空集合查詢有特判嗎？",
      ],
    }),
    sub("座標壓縮", "座標範圍大但實際端點少時，映射到排名再掃描或差分。", {
      what: "座標壓縮把所有出現的座標（區間端點、查詢點）收集、排序、去重，映射到 0..m-1 的排名。之後在壓縮座標上建差分、Fenwick 或掃描。",
      intuition:
        "值域 10^9 但事件只有 n 個時，只需 n 個離散點。壓縮後陣列大小 O(n)，避免開巨大陣列。",
      when: "- 座標到 10^9 但區間/查詢只有數千個。\n- 離線查詢、範圍加、覆蓋統計。\n- sweep_compressed_fenwick 類題型。",
      how: "```cpp\nvector<int> xs = allCoords;\nsort(xs.begin(), xs.end());\nxs.erase(unique(xs.begin(), xs.end()), xs.end());\nauto rank = [&](int x) {\n  return lower_bound(xs.begin(), xs.end(), x) - xs.begin();\n};\n```",
      mistakes:
        "- 漏收集某些端點（如 r+1）。\n- 查詢座標未加入壓縮集合。\n- rank 與實際座標混淆。\n- 壓縮後仍用原座標當陣列下標。",
      checklist: [
        "所有端點與查詢點都收集了嗎？",
        "r+1 端點有納入嗎？",
        "排序去重後 rank 正確嗎？",
        "壓縮後差分/Fenwick 大小是 O(n) 嗎？",
      ],
    }),
  ],
  93010: [
    sub(
      "單調堆疊與單調佇列",
      "維護單調遞增或遞減的候選集合，彈出被支配的舊元素。",
      {
        what: "單調堆疊/佇列維護一個候選序列，值（或對應下標的值）保持遞增或遞減。新元素到來時，彈出所有被它支配的舊候選。單調堆疊處理靜態序列；單調佇列還要處理下標過期（視窗邊界）。",
        intuition:
          "若舊候選比新候選差且更遠，它就永遠不會再成為答案。彈出被支配者，保留可能最佳的少數候選。",
        when: "- 下一個更大/更小、視窗極值、DP 轉移候選。\n- 739、239、862、907。\n- 需要 O(n) 找每個位置左右第一個更大/更小。",
        how: "```cpp\n// 單調遞減堆疊（找下一個更大）\nstack<int> st;\nfor (int i = 0; i < n; ++i) {\n  while (!st.empty() && nums[st.top()] < nums[i]) {\n    int j = st.top(); st.pop();\n    // j 的下一個更大是 i\n  }\n  st.push(i);\n}\n```",
        mistakes:
          "- 忘記存下標，無法算距離或過期。\n- 重複值比較 < 與 <= 不統一。\n- 堆疊與佇列混用：佇列要處理過期。\n- 單調方向選反。",
        checklist: [
          "找更大還是更小？遞增還是遞減棧？",
          "存的是下標還是值？",
          "重複值用 < 還是 <=？",
          "需要處理視窗過期嗎（用 deque）？",
        ],
      },
    ),
    sub("下一個更小元素", "維護遞增堆疊，遇到更小值時彈出並結算。", {
      what: "下一個更小元素（NGE 的對稱）：對每個元素，找右邊第一個比它小的。維護遞增堆疊（底小頂大），當 `nums[i] < nums[st.top()]` 時，st.top() 的下一個更小是 i。",
      intuition:
        "遞增棧保證棧內元素單調上升。新元素更小，表示它是棧頂右側第一個更小者。",
      when: "- 496、503、907（子陣列最小值之和）。\n- 貢獻法需要「作為最小值的左右邊界」。\n- 單調棧模板題。",
      how: "```cpp\nvector<int> st;\nfor (int i = 0; i < n; ++i) {\n  while (!st.empty() && nums[st.back()] > nums[i]) {\n    int j = st.back(); st.pop_back();\n    nextSmaller[j] = i;\n  }\n  st.push_back(i);\n}\n```",
      mistakes:
        "- 用遞減棧找更小（方向反了）。\n- 未處理棧內剩餘元素（無下一個更小）。\n- 左右掃描方向搞反。\n- 重複值 tie-break 與貢獻法不一致。",
      checklist: [
        "遞增棧找右邊第一個更小對嗎？",
        "棧內剩餘元素設為 n 或 -1 了嗎？",
        "找左邊需從右往左掃嗎？",
        "重複值歸屬規則統一了嗎？",
      ],
    }),
    sub("下一個更大元素", "維護遞減堆疊，遇到更大值時彈出並結算。", {
      what: "下一個更大元素：對每個元素找右邊第一個比它大的。維護遞減堆疊（底大頂小），當 `nums[i] > nums[st.top()]` 時，st.top() 的下一個更大是 i。",
      intuition:
        "739「每日溫度」是經典題：棧存等待更高溫的日期下標，今天更暖就結算棧頂等待天數。",
      when: "- 739、496、503。\n- 找右邊第一個更大/更暖。\n- 溫度、價格、高度單調棧。",
      how: "```cpp\nstack<int> st;\nvector<int> ans(n);\nfor (int i = 0; i < n; ++i) {\n  while (!st.empty() && nums[i] > nums[st.top()]) {\n    ans[st.top()] = i - st.top();\n    st.pop();\n  }\n  st.push(i);\n}\n```",
      mistakes:
        "- 遞增棧誤用於找更大。\n- 距離算成值而非下標差。\n- 棧空時未設預設值（0 或 -1）。\n- 從左掃與從右掃搞混。",
      checklist: [
        "遞減棧找右邊第一個更大對嗎？",
        "答案是下標差還是值？",
        "棧空元素的預設值設了嗎？",
        "496 用循環陣列時取模了嗎？",
      ],
    }),
    sub("滑動視窗最大值", "deque 存下標，值遞減，隊首是視窗最大值。", {
      what: "滑動視窗最大值用單調佇列（deque）：存下標，對應值遞減。新下標 i 來時，彈出隊尾所有值 ≤ nums[i] 的下標；若隊首下標過期（≤ i-k）就彈出；隊首即窗口最大值下標。",
      intuition:
        "deque 同時處理「被支配彈出」與「過期彈出」。每個下標最多進出一次，O(n)。",
      when: "- 239（滑動視窗最大值）、1438（絕對差限制的最長連續子陣列）。\n- 固定長度 k 的窗口極值。\n- 需要 O(n) 而非堆的 O(n log k)。",
      how: "```cpp\ndeque<int> dq;\nfor (int i = 0; i < n; ++i) {\n  while (!dq.empty() && dq.front() <= i - k) dq.pop_front();\n  while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();\n  dq.push_back(i);\n  if (i >= k - 1) ans.push_back(nums[dq.front()]);\n}\n```",
      mistakes:
        "- 過期條件寫成 i-k+1 錯誤。\n- 求最小值卻維持遞減 deque。\n- 存值而非下標，無法判斷過期。\n- 用 stack 無法處理隊首過期。",
      checklist: [
        "deque 存下標、值遞減對嗎？",
        "隊首過期條件是 <= i-k 嗎？",
        "求最小值時改為遞增 deque 嗎？",
        "i >= k-1 才輸出結果嗎？",
      ],
    }),
    sub(
      "最短子陣列",
      "含負數時和無單調性，用前綴和+單調佇列找最短達標子陣列。",
      {
        what: "209 在正數時用滑窗；含負數時和的單調性失效。862「和至少為 K 的最短子陣列」用前綴和 + 單調遞增 deque：維護可能成為最小左端的前綴下標，當 prefix[j]-prefix[i] ≥ K 時更新最短。",
        intuition:
          "prefix[j] - prefix[i] ≥ K ⇔ prefix[i] ≤ prefix[j] - K。對固定 j，要找最小的 i 使 prefix[i] 夠小，單調 deque 維護遞增前綴值的下標。",
        when: "- 862、209（全正數用滑窗，有負數改單調佇列）。\n- 和至少 K 的最短子陣列，陣列可有負數。\n- 滑動視窗因負數失效。",
        how: "```cpp\ndeque<int> dq; // 存下標，prefix 遞增\ndq.push_back(0);\nfor (int j = 1; j <= n; ++j) {\n  while (!dq.empty() && prefix[j] - prefix[dq.front()] >= K)\n    ans = min(ans, j - dq.front()), dq.pop_front();\n  while (!dq.empty() && prefix[dq.back()] >= prefix[j])\n    dq.pop_back();\n  dq.push_back(j);\n}\n```",
        mistakes:
          "- 全正數仍用複雜單調佇列（應滑窗）。\n- deque 未維持 prefix 遞增。\n- 空前綴下標 0 未初始化。\n- pop_front 時更新答案的時機錯。",
        checklist: [
          "陣列有負數嗎？還能用滑窗嗎？",
          "deque 維持 prefix 遞增下標嗎？",
          "prefix[0] 與下標 0 初始化了吗？",
          "達標時更新最短再 pop_front 嗎？",
        ],
      },
    ),
    sub(
      "類凸性轉移",
      "DP 轉移候選優劣隨 i 單調，用 deque 保留不被支配的候選。",
      {
        what: "類凸性轉移出現在 DP 轉移需從一段候選取最優，且候選的優劣順序隨 i 單調移動。可用 deque 維護「可能成為最優」的轉移來源，彈出被支配者，處理過期下標。",
        intuition:
          "類似單調佇列優化 DP：若 dp[j]+cost(j,i) 對 j 呈凸性，最佳 j 隨 i 單調。2945 等進階題會用到。",
        when: "- 2945、1696（跳躍遊戲 VI 的進階）。\n- DP 轉移要從窗口取最優且成本函數有單調性。\n- O(n²) DP 可優化到 O(n)。",
        how: "```cpp\n// 維護 deque 存候選 j，dp[j]+f(j,i) 的優劣可比較\ndeque<int> dq;\nfor (int i = 0; i < n; ++i) {\n  while (!dq.empty() && dq.front() < i - window) dq.pop_front();\n  dp[i] = dp[dq.front()] + cost(dq.front(), i);\n  while (!dq.empty() && better(i, dq.back())) dq.pop_back();\n  dq.push_back(i);\n}\n```",
        mistakes:
          "- 未驗證類凸/單調性就套 deque。\n- 過期條件 window 搞錯。\n- better 比較函數錯誤。\n- 與普通單調棧模板混用。",
        checklist: [
          "轉移候選的優劣隨 i 單調嗎？",
          "deque 過期條件正確嗎？",
          "better 比較的是 dp[j]+cost 嗎？",
          "這題確實需要 DP 優化嗎？",
        ],
      },
    ),
  ],
  93011: [
    sub("無權 BFS", "邊權全為 1 時，BFS 按層擴展，第一次到達即最短步數。", {
      what: "無權 BFS 用 queue 從起點逐層擴展。每個節點第一次被訪問時的距離即最短步數（邊權均為 1）。適用網格最短路、最少操作次數、狀態圖層級擴展。",
      intuition:
        "BFS 按距離遞增順序探索，類似水波紋擴散。第一次到達 = 最少邊數。用 `dist[v]=-1` 標未訪問，入隊時設 dist。",
      when: "- 1091（二維網格最短路）、1926（迷宮最短路）、127（單詞接龍）。\n- 每步代價相同（一步、一天、一次操作）。\n- 問最少步數、最少天數。",
      how: "```cpp\nqueue<pair<int,int>> q;\ndist[start] = 0; q.push(start);\nwhile (!q.empty()) {\n  auto [d, u] = q.front(); q.pop();\n  if (d != dist[u]) continue;\n  for (auto v : adj[u])\n    if (dist[v] == -1) dist[v] = d + 1, q.push({dist[v], v});\n}\n```",
      mistakes:
        "- 用 Dijkstra 處理全 1 邊權（多餘 log）。\n- 未標記 visited 造成重複入隊 TLE。\n- 四方向網格邊界、障礙未檢查。\n- 起點終點相同未特判。",
      checklist: [
        "邊權真的全是 1 嗎？",
        "第一次到達就記 dist，不重複更新嗎？",
        "網格四方向與邊界檢查了嗎？",
        "visited 或 dist=-1 用了嗎？",
      ],
    }),
    sub("0-1 BFS", "邊權只有 0 或 1 時，0 成本放 deque 前、1 成本放後。", {
      what: "0-1 BFS 用 deque：從 u 走權重 w 的邊到 v，若 dist[u]+w < dist[v] 則更新；w=0 時 push_front，w=1 時 push_back。保證按距離遞增處理，O(V+E)。",
      intuition:
        "0 邊不增加距離，應立即處理（放隊首）；1 邊放隊尾。是 Dijkstra 在 0/1 邊權下的特化，比堆更快。",
      when: "- 1368（最小費用路徑，移動 1、消除障礙 0）、2290（到達角落的最少障礙移除）。\n- 每步代價 0 或 1。\n- 網格中「免費移動」與「付費操作」混合。",
      how: "```cpp\ndeque<pair<int,int>> dq;\ndist[start] = 0; dq.push_front({0, start});\nwhile (!dq.empty()) {\n  auto [d, u] = dq.front(); dq.pop_front();\n  if (d != dist[u]) continue;\n  for (auto [v, w] : adj[u]) {\n    if (d + w < dist[v]) {\n      dist[v] = d + w;\n      if (w == 0) dq.push_front({dist[v], v});\n      else dq.push_back({dist[v], v});\n    }\n  }\n}\n```",
      mistakes:
        "- w=0 時 push_back（應 push_front）。\n- 未檢查 d!=dist[u] 造成重複擴展。\n- 用 BFS 處理 1 成本邊（距離不單調）。\n- 狀態維度不足（只存位置未存剩餘資源）。",
      checklist: [
        "邊權只有 0 和 1 嗎？",
        "w=0 push_front、w=1 push_back 了嗎？",
        "取出時檢查 d==dist[u] 了嗎？",
        "節點狀態包含必要維度嗎？",
      ],
    }),
    sub("Dijkstra", "非負邊權最短路，用 min-heap 按距離擴展，跳過過期項目。", {
      what: "Dijkstra 求單源最短路（非負權）。用 `priority_queue` 存 (dist, node)，每次取最小 dist 擴展。鬆弛：若 dist[u]+w < dist[v] 則更新並 push。",
      intuition:
        "非負權保證取出堆頂時距離已最終確定。同一節點可能多次入堆，取出時若 cost!=dist[u] 則為過期項目，continue 跳過。",
      when: "- 1631（最小體力消耗）、1514（概率最大路徑）、2577（最少時間）。\n- 邊權為正或零，非 0/1 一般情形。\n- 網格移動有不同代價。",
      how: "```cpp\npriority_queue<pair<long long,int>, vector<...>, greater<...>> pq;\ndist[s] = 0; pq.push({0, s});\nwhile (!pq.empty()) {\n  auto [d, u] = pq.top(); pq.pop();\n  if (d != dist[u]) continue;\n  for (auto [v, w] : adj[u])\n    if (d + w < dist[v]) dist[v] = d + w, pq.push({dist[v], v});\n}\n```",
      mistakes:
        "- 有負權邊仍用 Dijkstra。\n- 未跳過 stale entry。\n- dist 用 int 溢位。\n- 無向圖只加一條邊。",
      checklist: [
        "邊權全非負嗎？",
        "取出時 cost==dist[u] 才擴展嗎？",
        "dist 用 long long 了嗎？",
        "無向圖雙向加邊了嗎？",
      ],
    }),
    sub("狀態擴展", "節點除位置外還包含 mask、剩餘 k、方向、時間等維度。", {
      what: "狀態擴展把「節點」從單純位置擴成元組：(row, col, eliminated, mask, time%2, ...)。BFS/Dijkstra 在擴展狀態空間上跑，visited 也要對應多維。",
      intuition:
        "若最短路依賴「還能消除幾次障礙」「已收集哪些鑰匙」等，只看 (r,c) 不夠。把額外資訊編進狀態，圖變大但模型正確。",
      when: "- 1293（網格最短路有消除次數）、864（短詞網格）、1778（最近多點）。\n- visited 不能只看位置。\n- 有剩餘資源、 bitmask、時間條件。",
      how: "```cpp\n// 狀態 (r, c, k)\nusing State = tuple<int,int,int>;\nmap<State, int> dist;\ndist[{sr,sc,k}] = 0;\nqueue<State> q; q.push({sr,sc,k});\n```\n\n狀態數可能很大，需評估是否可承受；有時可壓縮或用 bitset。",
      mistakes:
        "- visited 只標 (r,c)，忽略 k/mask。\n- 狀態空間爆炸未優化。\n- 轉移遺漏某種操作。\n- 終點狀態條件不完整。",
      checklist: [
        "節點狀態除了位置還需要什麼？",
        "visited/dist 的 key 是完整狀態嗎？",
        "所有合法轉移都列舉了嗎？",
        "狀態空間規模可接受嗎？",
      ],
    }),
    sub("網格建圖", "四方向移動、邊界檢查、障礙處理，把網格轉成圖。", {
      what: "網格建圖：節點為 (r,c)，邊為四方向（或八方向）相鄰格。需檢查 0≤r<n、0≤c<m，以及 grid[r][c] 非障礙。權重可為 1、grid 值、或操作代價。",
      intuition:
        "網格題的第一步常是定義 neighbors 函數，統一處理邊界與障礙。BFS/0-1 BFS/Dijkstra 在鄰接函數上運作。",
      when: "- 幾乎所有網格最短路題。\n- 1091、1293、1631、2577。\n- 移動、消除、收集類網格題。",
      how: "```cpp\nconst int dr[4] = {-1,1,0,0}, dc[4] = {0,0,-1,1};\nauto valid = [&](int r, int c) {\n  return r>=0 && r<n && c>=0 && c<m && grid[r][c] != '#';\n};\nfor (int d = 0; d < 4; ++d) {\n  int nr = r + dr[d], nc = c + dc[d];\n  if (valid(nr, nc)) relax({nr, nc});\n}\n```",
      mistakes:
        "- 邊界 off-by-one。\n- 障礙字元判斷錯誤。\n- 八方向與四方向搞混。\n- 起點終點在障礙上未特判。",
      checklist: [
        "四方向還是八方向？",
        "邊界與障礙檢查完整嗎？",
        "邊權從哪裡來（1、格值、操作）？",
        "起點終點合法嗎？",
      ],
    }),
    sub(
      "過期項目",
      "priority_queue 中舊距離的條目，取出時若 cost≠dist 則跳過。",
      {
        what: "Dijkstra 中同一節點可能以不同距離多次入堆。取出堆頂 (cost, u) 時，若 cost != dist[u]，表示這是過期條目（已有更短路徑），直接 continue 不擴展。",
        intuition:
          "lazy deletion：不從堆中刪除舊條目，取出時驗證。攤還下每條邊最多觸發常數次有效擴展。",
        when: "- 所有 Dijkstra 實作。\n- 0-1 BFS 也可用 d!=dist[u] 防重複。\n- 堆中可能有 stale 條目時。",
        how: "```cpp\nauto [cost, u] = pq.top(); pq.pop();\nif (cost != dist[u]) continue; // 過期項目\n```",
        mistakes:
          "- 不檢查就擴展，重複且可能錯誤。\n- dist 未初始化為 INF。\n- 用 visited 永久標記而非 dist 比較（可能錯）。\n- 0-1 BFS 忘記同樣檢查。",
        checklist: [
          "取出堆頂後檢查 cost==dist[u] 了嗎？",
          "過期時 continue 不擴展嗎？",
          "dist 初始為 INF 了嗎？",
          "0-1 BFS 的 deque 也檢查了嗎？",
        ],
      },
    ),
  ],
  93012: [
    sub("動態規劃", "用狀態記住前綴最佳答案，轉移描述最後一步如何來。", {
      what: "動態規劃（DP）把問題拆成重疊子問題，用狀態 `dp[...]` 記錄「處理到某範圍後的最優值」。轉移描述最後一步：選、不選、結束段、延續段。目標是把指數遞迴壓成多項式表格。",
      intuition:
        "若未來只依賴過去的少數摘要，就有最優子結構。先寫暴力遞迴，找重複子問題，再改為自底向上或滾動陣列。",
      when: "- 每個元素可選可不選、最多 K 個、不重疊區間。\n- 排序後找上一個相容物件。\n- 問最大/最小值、方案數。",
      how: "三步：① 定義 `dp[i]` 或 `dp[i][k]` 語意；② 寫轉移（選/不選、max/min）；③ 定初值與遍歷順序。\n\n```cpp\nfor (int i = 0; i < n; ++i) {\n  dp[i] = max(dp[i-1], dp[i-2] + nums[i]);\n}\n```",
      mistakes:
        "- dp 定義含糊，轉移矛盾。\n- 初始化非法狀態為 0。\n- 遍歷順序錯，讀到未算好的狀態。\n- 該用 DP 卻用貪心。",
      checklist: [
        "dp 狀態一句話說得清嗎？",
        "最後一步是選、跳過還是分段？",
        "初值與不可能狀態處理了嗎？",
        "遍歷順序保證依賴已計算嗎？",
      ],
    }),
    sub("選或不選", "對每個元素決定取或不取，轉移為 max(skip, take)。", {
      what: "選或不選模型：對第 i 個元素，要麼不選（繼承 dp[i-1]），要麼選（dp[i-2]+value，若不能相鄰）。經典題：198 打家劫舍、213 環形、337 樹形。",
      intuition:
        "取 nums[i] 就不能取 i-1，所以 take 來自 i-2。不取則來自 i-1。可壓成兩個變數 skip/take 滾動。",
      when: "- 198、213、337、740。\n- 相鄰不能同時選。\n- 最大化選取總和。",
      how: "```cpp\nlong long skip = 0, take = 0;\nfor (int x : nums) {\n  long long ntake = skip + x;\n  long long nskip = max(skip, take);\n  skip = nskip; take = ntake;\n}\nreturn max(skip, take);\n```",
      mistakes:
        "- 相鄰限制卻用 dp[i-1]+x。\n- 環形未拆成兩段線性。\n- 樹形 DP 父子同選未禁止。\n- 滾動時變數覆蓋順序錯。",
      checklist: [
        "相鄰能同時選嗎？",
        "take 來自 i-2 還是 i-1？",
        "環形拆成不含首/不含尾兩段了嗎？",
        "滾動變數更新順序對嗎？",
      ],
    }),
    sub(
      "至多 K 個選擇",
      "多一維 k 表示已選個數，dp[i][k] 為處理前 i 個選至多 k 個的最優。",
      {
        what: "至多 K 個選擇在狀態中加維度 k：`dp[i][k]` = 考慮前 i 個物品，最多選 k 個的最大值。轉移：不選第 i 個 → dp[i-1][k]；選第 i 個 → dp[i-1][k-1]+value。",
        intuition:
          "k 維度追蹤資源消耗。類似背包但限制選取個數而非容量。可壓成一維 k，注意 k 遍歷方向。",
        when: "- 1235（規劃日程）、2140（兩場比賽最高分）、1881（插入後最大子陣列和）。\n- 最多選 k 個、恰好 k 段。\n- 有選取數量上限。",
        how: "```cpp\nfor (int i = 0; i < n; ++i)\n  for (int k = K; k >= 1; --k)\n    dp[k] = max(dp[k], dp[k-1] + value[i]);\n```\n\n依問題決定 k 正序還是倒序。",
        mistakes:
          "- k 維遍歷方向錯（0/1 背包需倒序）。\n- 混淆「至多 k」與「恰好 k」。\n- dp[k] 初值錯誤。\n- i 與 k 語意搞混。",
        checklist: [
          "是至多 k 還是恰好 k？",
          "k 維遍歷方向正確嗎？",
          "dp[k] 初值合理嗎？",
          "選第 i 個時 k-1 狀態存在嗎？",
        ],
      },
    ),
    sub("不重疊子陣列", "選取的區間不能重疊，需找上一個相容位置轉移。", {
      what: "不重疊子陣列/區間 DP：選區間 [i,j] 時，需找最後一個與它不重疊的區間 p，`dp[j] = max(dp[j], dp[p] + weight)`。常先按右端點排序，二分找 p。",
      intuition:
        "類似區間調度：排序後，每個區間只與之前的相容區間轉移。1235、1751 是代表題。",
      when: "- 1235、1751、2008（出租車）。\n- 選區間、選任務，不能時間重疊。\n- 最大化選取總權重。",
      how: "```cpp\nsort(intervals, byEnd);\nfor (int i = 0; i < n; ++i) {\n  int p = lastNonOverlap(i); // 二分\n  dp[i] = max(dp[i-1], dp[p] + profit[i]);\n}\n```",
      mistakes:
        "- 未排序就轉移。\n- 重疊判斷錯誤（應 end<=start）。\n- 二分邊界 off-by-one。\n- dp[i] 語意是「考慮前 i 個」還是「以 i 結尾」。",
      checklist: [
        "按右端點排序了嗎？",
        "相容條件是 prev.end <= curr.start 嗎？",
        "二分找最後一個相容區間了嗎？",
        "dp 狀態語意清楚嗎？",
      ],
    }),
    sub("狀態壓縮", "發現轉移只依賴前一層或少數變數，把二維壓成一維滾動。", {
      what: "狀態壓縮把 DP 表格從 O(n²) 或 O(n×k) 壓到 O(n) 或 O(k)。常見：打家劫舍用 skip/take 兩變數；背包 k 維一維陣列滾動；LIS 用 patience 或 dp 陣列。",
      intuition:
        "若 dp[i] 只依賴 dp[i-1] 和 dp[i-2]，不需存整表。滾動時注意讀寫順序，避免覆蓋仍需要的舊值。",
      when: "- 198、322、300、70。\n- 空間優化要求。\n- 轉移只依賴固定前幾項。",
      how: "```cpp\n// 0/1 背包壓縮到一維\ndp[0] = 0;\nfor (int i = 0; i < n; ++i)\n  for (int c = C; c >= w[i]; --c)\n    dp[c] = max(dp[c], dp[c-w[i]] + v[i]);\n```",
      mistakes:
        "- 完全背包卻倒序遍歷容量。\n- 滾動時讀到已覆蓋的新值。\n- 壓縮後初值錯誤。\n- 多維依賴卻強行壓成一維。",
      checklist: [
        "轉移只依賴哪些舊狀態？",
        "容量/k 遍歷正序還是倒序？",
        "滾動時會覆蓋還需要的值嗎？",
        "壓縮後語意仍正確嗎？",
      ],
    }),
    sub(
      "DP 加資料結構",
      "轉移需查歷史最佳值，用 map、堆、Fenwick、二分優化。",
      {
        what: "DP 加資料結構：轉移時需查「滿足條件的前狀態最優值」，若暴力掃 O(n) 會 TLE。用有序 map、堆、Fenwick tree、線段樹在 O(log n) 查詢。",
        intuition:
          "例如 dp[i] 需 max{dp[j] | j<i 且 compatible(j,i)}。若 i 遞增且查詢條件單調，可維護資料結構插入 dp[j]。",
        when: "- 3186、2320、2830、3077。\n- 轉移需查前綴最大、滿足約束的最優 j。\n- O(n²) DP 需優化到 O(n log n)。",
        how: "```cpp\nmap<int, long long> best; // key 為某屬性，value 為 dp 最優\nfor (int i = 0; i < n; ++i) {\n  dp[i] = query(best, i) + gain[i];\n  best[key(i)] = max(best[key(i)], dp[i]);\n}\n```",
        mistakes:
          "- 資料結構 key 設計錯誤。\n- 查詢條件與插入不同步。\n- 忘記維護單調性。\n- 複雜度仍為 O(n²)。",
        checklist: [
          "轉移要查什麼歷史最優？",
          "資料結構的 key 是什麼？",
          "插入與查詢順序正確嗎？",
          "複雜度降到 O(n log n) 了嗎？",
        ],
      },
    ),
  ],
  93013: [
    sub("貢獻法", "換角度計算每個元素被多少子陣列使用，再累加 L×R 次貢獻。", {
      what: "貢獻法不枚舉所有子陣列，而是問：每個元素（或字元）在多少個合法子陣列中扮演關鍵角色？若左邊有 L 種起點、右邊有 R 種終點，貢獻次數通常為 L×R，再乘以該元素對答案的貢獻值。",
      intuition:
        "O(n²) 子陣列枚舉改為 O(n) 逐元素算邊界。難點在於找出「在哪些範圍內該元素是唯一最小值/最大值/唯一字元」。",
      when: "- 828（唯一字元子串總和）、907（子陣列最小值之和）、2104。\n- 問所有子陣列/子字串的總和。\n- 答案可拆成每個元素的影響。",
      how: "```cpp\n// nums[i] 作為最小值的貢獻\nlong long L = i - prevLess[i];\nlong long R = nextLessEq[i] - i;\nans += L * R * nums[i];\n```\n\n先單調棧找邊界，再乘積累加。",
      mistakes:
        "- 仍枚舉所有子陣列。\n- L×R 少算 1。\n- 乘法溢位未用 long long。\n- 重複值 tie-break 不一致。",
      checklist: [
        "答案能拆成每個元素的加總嗎？",
        "左右邊界怎麼定？",
        "貢獻次數是 L×R 嗎？",
        "用 long long 了嗎？",
      ],
    }),
    sub("前後出現位置", "字元在兩次相鄰出現之間才是該字元的唯一出現。", {
      what: "前後出現位置：對字元 c，記 prev[c] 為上一次出現位置。在 (prev[c], i] 區間內 c 是最後一次出現，可與右邊界組合計算「c 為唯一字元」的子字串數。828 唯一字元子串總和是經典應用。",
      intuition:
        "字元 c 在子字串中「只出現一次」⇔ 子字串包含位置 i 的 c，且不包含 prev 與 next 的 c。左端有 (i-prev) 種，右端有 (next-i) 種。",
      when: "- 828、2262（字串總和）、子字串唯一字元問題。\n- 貢獻與「唯一出現」相關。\n- 需 prev/next 位置陣列。",
      how: "```cpp\nint prev[26], next[26];\n// 預處理每個字元的 prev 和 next 位置\nfor (int i = 0; i < n; ++i) {\n  int l = i - prev[c], r = next[c] - i;\n  ans += 1LL * l * r * value(c);\n}\n```",
      mistakes:
        "- prev/next 未預處理。\n- 邊界距離 off-by-one。\n- 多字元同時唯一時邏輯錯誤。\n- 忘記乘以字元貢獻值（如 ASCII 碼）。",
      checklist: [
        "prev 和 next 都預處理了嗎？",
        "左邊界距離是 i-prev 嗎？",
        "右邊界距離是 next-i 嗎？",
        "這題真的只有「唯一字元」條件嗎？",
      ],
    }),
    sub(
      "前後更小元素",
      "單調棧找左右第一個更小，決定 nums[i] 作為最小值的範圍。",
      {
        what: "前後更小元素：用單調棧對每個 i 找 prevLess[i]（左邊第一個更小）和 nextLess[i]（右邊第一個更小或相等，依 tie-break）。在 (prevLess, nextLess) 開區間內，nums[i] 是子陣列最小值。",
        intuition:
          "907：子陣列最小值之和 = Σ nums[i] × (i-prevLess) × (nextLess-i)。重複值需統一 tie-break（通常左側严格小、右側小于等于）。",
        when: "- 907、2104（子陣列和中的最大子陣列和）。\n- 元素作為子陣列最小值的貢獻。\n- 需單調棧找邊界。",
        how: "```cpp\n// 左邊第一個严格更小，右邊第一個更小或相等\nwhile (!st.empty() && nums[st.top()] >= nums[i]) st.pop();\nprevLess[i] = st.empty() ? -1 : st.top();\n```\n\n左右掃描或一次掃描+兩種比較符。",
        mistakes:
          "- 重複值 < 與 <= 混用導致重複計數。\n- 左右掃描 tie-break 不一致。\n- 開區間與閉區間搞混。\n- 棧內剩餘邊界設為 -1/n。",
        checklist: [
          "重複值歸左還是歸右？",
          "左用 < 右用 <= 統一了嗎？",
          "貢獻公式 (i-prev)*(next-i) 對嗎？",
          "棧空時邊界是 -1 和 n 嗎？",
        ],
      },
    ),
    sub(
      "前後更大元素",
      "單調棧找左右第一個更大，決定 nums[i] 作為最大值的範圍。",
      {
        what: "前後更大元素與更小對稱：找 prevGreater 和 nextGreater，在區間內 nums[i] 是子陣列最大值。用於子陣列最大值貢獻、1856 等題。",
        intuition:
          "遞增棧找更大，或遞減棧找更小——方向要與「作為最大/最小」一致。貢獻公式同樣是 L×R×value。",
        when: "- 1856、子陣列最大值之和類題。\n- 元素作為子陣列最大值的次數。\n- 與 907 對稱的模型。",
        how: "```cpp\n// nums[i] 作為最大值\nwhile (!st.empty() && nums[st.top()] <= nums[i]) st.pop();\nprevGreater[i] = st.empty() ? -1 : st.top();\n```\n\n注意與「更小」的 tie-break 對稱性。",
        mistakes:
          "- 與更小元素棧方向搞反。\n- tie-break 與 907 不一致導致重複/漏算。\n- 2104 需同時考慮最大與最小貢獻。\n- 貢獻值符號錯誤。",
        checklist: [
          "找更大用遞增還是遞減棧？",
          "tie-break 與更小版本對稱嗎？",
          "L×R 公式適用於最大值嗎？",
          "2104 類題最大最小都要算嗎？",
        ],
      },
    ),
    sub(
      "子字串貢獻",
      "用 last position 或 previous two positions 計算字元/子串貢獻。",
      {
        what: "子字串貢獻常追蹤每個字元最近兩次出現位置。新出現位置 i 時，與 prev1、prev2 組合可計算「新增」的不重複子字串數，避免重複計數。",
        intuition:
          "2262 等題：每個新字元 c 在位置 i 帶來的新子字串數 = i - prev[c]，因為以 i 結尾且只含最近這個 c 的前綴有 (i-prev) 個。",
        when: "- 2262、2681、子字串計數與唯一性。\n- 問子字串總數、權重和。\n- 需避免重複計數相同子字串。",
        how: "```cpp\nlong long ans = 0;\nfor (int i = 0; i < n; ++i) {\n  ans += i - prev[s[i]];\n  prev[s[i]] = i;\n}\n// 子字串總數 = n*(n+1)/2 的變形\n```",
        mistakes:
          "- 重複計數已算過的子字串。\n- prev 初值應為 -1。\n- 多字元條件未同時滿足。\n- 與唯一字元貢獻公式搞混。",
        checklist: [
          "prev 初值是 -1 嗎？",
          "新增子字串數是 i-prev 嗎？",
          "會重複計數嗎？",
          "多字元約束都考慮了嗎？",
        ],
      },
    ),
    sub(
      "子陣列最小/最大值貢獻",
      "結合單調棧邊界與元素值，計算 Σ L×R×nums[i]。",
      {
        what: "子陣列最小/最大值貢獻是貢獻法+單調棧的標準組合：對每個 i，計算以其為最小（或最大）的子陣列個數 L×R，乘以 nums[i] 累加。2104 需枚舉每個子陣列的最大段並用貢獻法。",
        intuition:
          "907 原型：ans = Σ nums[i] × leftCount × rightCount。leftCount = i - prevLess[i]，rightCount = nextLessEq[i] - i。",
        when: "- 907、2104、1856。\n- 所有子陣列最小值/最大值之和。\n- O(n) 單調棧 + 貢獻。",
        how: "```cpp\nfor (int i = 0; i < n; ++i) {\n  long long l = i - prevLess[i];\n  long long r = nextLessEq[i] - i;\n  sumMin += l * r * nums[i];\n}\n```\n\n2104 需額外處理「最大子陣列和」的貢獻拆分。",
        mistakes:
          "- 2104 直接枚舉子陣列 TLE。\n- 最大與最小 tie-break 不統一。\n- 溢位。\n- 邊界陣列未正確初始化。",
        checklist: [
          "單調棧邊界算對了嗎？",
          "L×R×nums[i] 累加了嗎？",
          "2104 最大段貢獻拆分了嗎？",
          "long long 防溢位了嗎？",
        ],
      },
    ),
  ],
  93014: [
    sub("位元技巧", "利用 AND、OR、XOR 的代數性質與 bit 單調性解題。", {
      what: "位元技巧運用 &, |, ^, ~, <<, >> 的性質。OR 只增 bit、AND 只減 bit、XOR 無單調性。常用於子陣列位元值統計、狀態壓縮、奇偶性。",
      intuition:
        "不同運算有不同結構：OR/AND 子陣列的不同值個數被 bit 數限制在 O(32n)；XOR 常用前綴 XOR 或 trie。",
      when: "- 題目出現 AND、OR、XOR、mask、子集。\n- 1863、898、1442、2044。\n- 字母種類少、mask 有限。",
      how: "先判斷運算類型：\n- OR/AND：右端固定，向左擴展，不同值 ≤ 32。\n- XOR：prefixXor[i]^prefixXor[j]。\n- 單 bit：奇偶、翻轉。",
      mistakes:
        "- XOR 當 OR 做單調壓縮。\n- 1<<bit 溢位（應 1LL<<bit）。\n- AND 初始值錯。\n- 滑窗 OR 直接減值。",
      checklist: [
        "這題是 OR、AND 還是 XOR？",
        "OR/AND 能狀態壓縮嗎？",
        "mask 會溢位嗎？",
        "XOR 用前綴還是 trie？",
      ],
    }),
    sub(
      "OR 狀態壓縮",
      "固定右端，保存所有以它結尾的子陣列 OR 值，不同值最多 32 個。",
      {
        what: "OR 狀態壓縮：對固定右端 i，維護集合 S = {OR(nums[j..i]) | 0≤j≤i}。加入 nums[i] 時，新集合 = {nums[i]} ∪ {x|nums[i] | x : x∈S}。因 OR 只增 bit，|S| ≤ 32。",
        intuition:
          "896（單一數字 OR）、898（子陣列 OR 能整除查詢）都利用 OR 值種類少。每個右端 O(32) 更新。",
        when: "- 898、2044（計數 OR 值）、2433。\n- 子陣列 OR 統計、查詢。\n- 需要枚舉子陣列 OR 但 n 很大。",
        how: "```cpp\nunordered_map<int, long long> cur, nxt;\nfor (int x : nums) {\n  nxt.clear(); nxt[x] = 1;\n  for (auto [v, c] : cur) nxt[v | x] += c;\n  cur.swap(nxt);\n}\n```",
        mistakes:
          "- 以為 OR 值有 O(n) 種 TLE。\n- 未合併相同 OR 值的計數。\n- 滑窗 OR 用減法維護。\n- map 改用 vector 可常數優化。",
        checklist: [
          "每步不同 OR 值 ≤ 32 嗎？",
          "新集合 = {x} ∪ {v|x} 更新了嗎？",
          "相同 OR 值計數合併了嗎？",
          "滑窗 OR 用 bit 頻次了嗎？",
        ],
      },
    ),
    sub(
      "AND 狀態壓縮",
      "與 OR 對稱，AND 的 bit 只會從 1 掉到 0，不同值同樣有限。",
      {
        what: "AND 狀態壓縮與 OR 對稱：對固定右端，維護所有以它結尾的子陣列 AND 值。新值 = nums[i] 與舊值 AND。不同 AND 值個數 ≤ 32。",
        intuition:
          "1521、3209 等題。AND 單調遞減（bit 意義上），集合大小有界。",
        when: "- 1521、3209、AND 子陣列查詢。\n- 統計不同 AND 值。\n- 與 OR 壓縮對稱的題型。",
        how: "```cpp\nfor (int x : nums) {\n  nxt.clear(); nxt[x] = 1;\n  for (auto [v, c] : cur) nxt[v & x] += c;\n  cur.swap(nxt);\n}\n```",
        mistakes:
          "- 初始 AND 值設為 0（應從 x 開始）。\n- 與 OR 模板混淆（| 寫成 &）。\n- 空子陣列處理錯誤。\n- 未累加計數。",
        checklist: [
          "新集合用 v & x 更新了嗎？",
          "初始值從 nums[i] 開始嗎？",
          "不同 AND 值 ≤ 32 嗎？",
          "與 OR 方向搞混了嗎？",
        ],
      },
    ),
    sub("XOR 狀態", "XOR 無單調性，常用前綴 XOR 或 trie 處理子陣列異或查詢。", {
      what: "XOR 狀態：prefixXor[i] = a[0]^a[1]^...^a[i-1]，子陣列 i..j 的 XOR = prefixXor[j+1] ^ prefixXor[i]。查「異或為 k」轉為找 prefixXor[j+1] ^ prefixXor[i] = k ⇔ prefixXor[i] = prefixXor[j+1] ^ k。",
      intuition:
        "XOR 自反：a^a=0，a^0=a。可配合 trie 找最大異或對、計數異或為 k 的子陣列。",
      when: "- 1442、1863、2411、1371。\n- 子陣列 XOR 等於 k、最大 XOR。\n- 不能用 OR/AND 壓縮。",
      how: "```cpp\nint prefix = 0;\nmap<int,int> freq{{0,1}};\nfor (int x : nums) {\n  prefix ^= x;\n  ans += freq[prefix ^ k];\n  ++freq[prefix];\n}\n```",
      mistakes:
        "- 對 XOR 用 OR 壓縮模板。\n- 空前綴 prefix=0 未入 map。\n- trie 位元順序錯誤。\n- 異或與加法混淆。",
      checklist: [
        "用前綴 XOR 轉換了嗎？",
        "freq[0]=1 處理空前綴了嗎？",
        "查詢鍵是 prefix^k 嗎？",
        "需要 trie 時位元從高位掃嗎？",
      ],
    }),
    sub("bitset 優化", "用 bitset 批次表示集合轉移，加速可達和或 DP。", {
      what: "bitset 把布林陣列壓成機器字，支援 O(n/w) 的移位、或、與操作。常用於「可達和」DP：dp |= dp << weight。C++ `bitset<MAX>` 或 vector<uint64_t>。",
      intuition:
        "若 DP 狀態是「哪些和可達」，bitset 比逐個更新快 w 倍（w=字長）。適合背包可達性、子集和。",
      when: "- 可達和、子集划分、有限狀態集合转移。\n- 狀態是 0/1 可達向量。\n- n 不大但和很大。",
      how: "```cpp\nbitset<MAXS> dp;\ndp[0] = 1;\nfor (int w : weights) dp |= dp << w;\nreturn dp[sum];\n```",
      mistakes:
        "- MAXS 開太小溢位。\n- 移位方向錯誤。\n- 該用值 DP 卻用 bitset 可達性。\n- 未考慮空間限制。",
      checklist: [
        "狀態是 0/1 可達嗎？",
        "bitset 大小夠嗎？",
        "dp |= dp << w 更新了嗎？",
        "比陣列 DP 真的更快嗎？",
      ],
    }),
    sub(
      "有限 mask 狀態",
      "字母種類、奇偶性、選取狀態用整數 mask 壓縮，狀態數 2^k。",
      {
        what: "有限 mask 狀態用整數 bitmask 表示集合：第 b 位為 1 表示含有某字母/某性質。狀態數 2^k，k 小時可 BFS/DP。常見於字母種類 ≤20、奇偶性、TSP 小規模。",
        intuition:
          "把「集合狀態」編碼成整數，轉移用位運算：mask | (1<<c)、popcount(mask)==k。",
        when: "- 1074（二進位矩陣）、1442、狀態 BFS mask。\n- 字母種類少、需追蹤已出現集合。\n- 2^k 可接受（k≤20）。",
        how: "```cpp\nint mask = 0;\nmask |= 1 << (c - 'a');\nif (__builtin_popcount(mask) == k) { /* 合法 */ }\n```",
        mistakes:
          "- k 太大 2^k 爆炸。\n- 1<<26 溢位（用 1LL<<26）。\n- popcount 與種類數語意混。\n- mask 未初始化。",
        checklist: [
          "狀態數 2^k 可接受嗎？",
          "1<<bit 會溢位嗎？",
          "mask 更新用 OR 了嗎？",
          "popcount 代表種類數嗎？",
        ],
      },
    ),
  ],
  93015: [
    sub(
      "資料結構設計",
      "為每個操作建立權威狀態與查詢索引，支援高效 update/query。",
      {
        what: "資料結構設計題要求實作 class，支援多次操作。核心是拆分「權威狀態」（真實資料）與「查詢索引」（快速回答最大、最小、第 k、版本）。",
        intuition:
          "每個操作先想：改什麼？查什麼？權威狀態用 map/vector 存真相；索引用 heap、set、Fenwick 加速。更新可能使索引過期，需延遲刪除或同步更新。",
        when: "- 981、1146、2034、2349。\n- 多次 update/query 交錯。\n- LeetCode Design 類題。",
        how: "設計步驟：\n1. 列出所有操作與複雜度要求。\n2. 定義權威狀態結構。\n3. 為每種查詢選索引（heap/set/map）。\n4. 處理過期與 tie-break。",
        mistakes:
          "- 無權威狀態，多份資料矛盾。\n- 索引未驗證過期。\n- 複雜度分析錯誤。\n- tie-break、邊界未處理。",
        checklist: [
          "每個操作讀寫什麼？",
          "權威狀態是哪一份？",
          "查詢用什麼索引？",
          "更新後索引如何失效/同步？",
        ],
      },
    ),
    sub("堆積加映射表", "heap 負責候選極值，map 存 id 對應的目前真實值。", {
      what: "堆積加映射表：`unordered_map<id, value>` 存目前真實分數；`priority_queue` 存 (value, id) 候選。查詢最大時 pop 堆頂直到 `map[top.id] == top.value`。更新時改 map 並 push 新條目。",
      intuition:
        "heap 不刪舊條目，map 是真相。經典於 2353（設計食物評分系統）、2034（股票價格波動）。",
      when: "- 分數/價格會變，需取全局最大/最小。\n- 2349、2353。\n- 標準 heap + lazy deletion。",
      how: "```cpp\nvoid update(string id, int score) {\n  current[id] = score;\n  heap.push({score, id});\n}\nint best() {\n  while (!heap.empty() && current[heap.top().id] != heap.top().score)\n    heap.pop();\n  return heap.top().score;\n}\n```",
      mistakes:
        "- 只改 heap 不改 map。\n- stale 判斷用錯欄位。\n- 刪除 id 時 map 未 erase。\n- 堆空未處理。",
      checklist: [
        "map 是權威狀態嗎？",
        "更新時 map 與 push heap 都做了嗎？",
        "查詢前 while 清理 stale 了嗎？",
        "刪除操作同步 map 了嗎？",
      ],
    }),
    sub("有序集合", "用 set/multiset 支援按序查最小、最大、前驅、後繼。", {
      what: "有序集合（`set`/`multiset`）維護排序後的元素，支援 O(log n) 插入、刪除、查最小/最大、lower_bound/upper_bound。適用需要按值順序回答查詢的設計題。",
      intuition:
        "若查詢是「比 x 大的最小值」「第 k 小」「範圍內個數」，有序集合比 heap 更靈活。",
      when: "- 1912（設計電影評分系統）、2102（旅館預訂）、220（存在重複元素 III 的 set 查鄰居）。\n- 需要前驅後繼、範圍查詢。\n- 元素會刪除，不能只 push heap。",
      how: "```cpp\nmultiset<int> ms;\nms.insert(x);\nms.erase(ms.find(old)); // 刪一個\nauto it = ms.lower_bound(x); // >= x 最小\n```",
      mistakes:
        "- multiset erase(x) 刪光所有 x。\n- lower_bound 返回 end 未檢查。\n- 應 unique 卻用 multiset。\n- 迭代器失效後仍使用。",
      checklist: [
        "需要排序查詢嗎？",
        "erase 一個還是全部？",
        "lower_bound 結果檢查 end 了嗎？",
        "重複元素用 multiset 嗎？",
      ],
    }),
    sub(
      "頻次追蹤",
      "維護值→次數、次數→值集合的雙向映射，支援 O(1) 頻次查詢。",
      {
        what: "頻次追蹤用 `map<value, count>` 記每個值出現幾次；進階用 `map<count, set<value>>` 找「出現 k 次的值」或「最大頻次」。981 最近七天價格、3408 等會用到。",
        intuition:
          "雙向映射讓「按值更新」與「按頻次查詢」都高效。更新時先從舊頻次桶移除，再加入新頻次桶。",
        when: "- 981、3408、頻次統計設計題。\n- 查「最高頻元素」「出現 exactly k 次的值」。\n- 需要動態維護頻次分布。",
        how: "```cpp\nvoid add(int x) {\n  int old = cnt[x]++;\n  bucket[old].erase(x);\n  bucket[old+1].insert(x);\n}\n```",
        mistakes:
          "- 頻次減到 0 未從 bucket 移除。\n- 空 bucket 未清理。\n- 多個同頻次值的 tie-break 錯。\n- cnt 與 bucket 不同步。",
        checklist: [
          "cnt 與 bucket 同步更新了嗎？",
          "頻次歸零從 bucket 移除了嗎？",
          "同頻次多值時 tie-break 定了嗎？",
          "查詢最大頻次從 bucket.rbegin 取嗎？",
        ],
      },
    ),
    sub("延遲刪除", "允許索引中保留過期資料，查詢時驗證並彈出堆頂或集合項。", {
      what: "延遲刪除是設計題常用技巧：更新/刪除時只改權威狀態，索引中舊條目留到查詢時再清理。堆頂 while 驗證；set 中可標記刪除或查詢時跳過。",
      intuition:
        "攤還分析：每個元素最多進出索引常數次。比實現任意刪除 heap 元素簡單得多。",
      when: "- 所有 heap+map 設計題。\n- 分數更新、任務取消、價格變動。\n- 需要極值查詢但資料會變。",
      how: "```cpp\nwhile (!pq.empty() && !isValid(pq.top())) pq.pop();\nif (pq.empty()) return default;\nreturn pq.top();\n```",
      mistakes:
        "- 從不清理，記憶體/leak 式增長。\n- isValid 與權威狀態不一致。\n- 刪除 id 後仍被當有效。\n- 多索引只清理一個。",
      checklist: [
        "查詢前 while 清理過期了嗎？",
        "isValid 對照權威狀態嗎？",
        "刪除後 isValid 回 false 嗎？",
        "空索引有預設回傳嗎？",
      ],
    }),
    sub(
      "索引查找",
      "用 id→位置、時間→價格、key→版本列表建立 O(1) 或 O(log n) 查找。",
      {
        what: "索引查找維護輔助映射：id→陣列下標（2349）、timestamp→price（981）、key→歷史版本列表（1146 快照）。讓 update/query 能 O(1) 定位，而非線性掃描。",
        intuition:
          "權威資料可能存於 vector，但需要快速按 id 或時間查找。輔助 map 是第二索引。",
        when: "- 1146（快照陣列）、2349（最高可見樓層）、981。\n- 按 id、時間、版本查詢。\n- 需 random access by key。",
        how: "```cpp\nunordered_map<int,int> idToIndex;\nvector<Item> items;\nvoid update(int id, int val) {\n  if (!idToIndex.count(id)) idToIndex[id] = items.size(), items.push_back({id,val});\n  else items[idToIndex[id]].val = val;\n}\n```",
        mistakes:
          "- 刪除後 idToIndex 未更新。\n- 時間戳未排序，二分查錯。\n- 版本列表未 append 只 overwrite。\n- 快照未 copy-on-write。",
        checklist: [
          "按什麼 key 查找（id/時間/版本）？",
          "輔助 map 與主資料同步嗎？",
          "刪除/移動後索引更新了嗎？",
          "1146 類快照如何存版本？",
        ],
      },
    ),
  ],
};

export const Q3_PATTERN_TOPIC_IDS = [
  93005, 93006, 93007, 93008, 93009, 93010, 93011, 93012, 93013, 93014, 93015,
] as const;

export type Q3PatternTopicId = (typeof Q3_PATTERN_TOPIC_IDS)[number];

export const Q3_PATTERN_META: Record<
  Q3PatternTopicId,
  { title: string; description: string; overview: string }
> = {
  93005: {
    title: "滑動視窗",
    description:
      "用一段連續區間承載當前狀態，右端負責擴張、左端負責收縮，藉此維持視窗的不變式。如此一來，原本要枚舉所有區間的工作就被壓縮到線性時間。",
    overview:
      "## 涵蓋主題\n\n以下每個子主題皆有獨立說明頁；建議依序閱讀後，再進入「搭配追蹤題單」練習。\n\n\n## 初學者先懂什麼\n\n視窗就是目前正在考慮的一段連續子陣列或子字串。初學者可以把它想成一把尺：右端點負責把新元素納入，左端點負責丟掉已經不適合的元素。關鍵不是兩個指標本身，而是你能否說清楚視窗內一直維持的條件。定長視窗的長度固定，例如每次只看 k 個元素；不定長視窗則依照條件伸縮。\n\n## 核心直覺\n\n如果右端點往右移時，某個條件只會朝一個方向變化，左端點就不需要回頭。這讓每個元素最多進入一次、離開一次。至多 K 維護「違規量不超過 K」；恰好 K 則常用 atMost(K) - atMost(K - 1)，因為所有至多 K 的集合扣掉至多 K - 1，剩下的正好是 K。\n\n## 典型讀題訊號\n\n- 題目明確要求連續子陣列或子字串。\n- 限制包含最多 K 次替換、刪除、不同值、零或特殊字元。\n- 全為正數時的和、乘積、分數限制常具備單調性。\n- 答案可依每個右端點新增 right - left + 1 個合法區間，或依每個左端點一次加上右側剩餘數量。\n\n\n## C++ 模板或偽程式\n\n```cpp\nlong long atMostKDistinct(vector<int>& nums, int k) {\n    if (k < 0) return 0;\n    unordered_map<int, int> freq;\n    long long ans = 0;\n    int left = 0;\n    for (int right = 0; right < (int)nums.size(); ++right) {\n        if (++freq[nums[right]] == 1) --k;\n        while (k < 0) {\n            if (--freq[nums[left]] == 0) ++k;\n            ++left;\n        }\n        ans += right - left + 1;\n    }\n    return ans;\n}\n```\n\n## 常見錯誤\n\n- 含負數的和通常不能直接滑窗，因為右端擴張後和不一定只變大。\n- 計數前必須確認不變式已恢復。\n- OR 視窗移出元素不能直接減掉，要用每個 bit 的頻次重建。\n- 左端驅動與右端驅動的加答案公式不同，混用會多算或少算。\n\n## 建議練習順序\n\n- 必修：先做 209、713、1004、1358，練右端驅動與基本縮窗。\n- 進階：做 992、2024、2302、2516，練 atMost 差分與左端驅動。\n- 挑戰：做 2762、2831、2962、3097，練頻次、位置陣列與位元視窗。\n\n## 我能認出這個模式嗎？\n\n- 我能說出視窗代表哪一段資料嗎？\n- 我知道不變式是「至多」、「至少」還是「固定長度」嗎？\n- 右端加入後，要在什麼條件下縮左端？\n- 答案是加 right-left+1、加 n-right，還是更新最長/最短？\n- 如果題目問恰好 K，我是否先檢查 atMost 差分？",
  },
  93006: {
    title: "前綴和與雜湊表",
    description:
      "把子陣列和改寫成兩個前綴值相減，再用雜湊表記住先前出現過的前綴。這套做法特別適合含負數、和等於 K 或整除等查詢。",
    overview:
      "## 涵蓋主題\n\n以下每個子主題皆有獨立說明頁；建議依序閱讀後，再進入「搭配追蹤題單」練習。\n\n\n## 初學者先懂什麼\n\n前綴和 prefix[i] 表示前 i 個元素的總和。子陣列 i..j 的和等於 prefix[j+1] - prefix[i]，所以「找子陣列」會變成「找以前是否有某個前綴」。雜湊表的用途是快速回答：這個需要的前綴以前出現幾次、最早在哪裡、或對應的最佳值是多少。\n\n## 核心直覺\n\n暴力枚舉左端和右端是 O(n^2)。如果右端已固定，合法左端只取決於以前的 prefix 值，就能在 O(1) 平均時間查出答案。模數前綴也是同一件事：兩個前綴除以 k 餘數相同，差值就能被 k 整除。二維前綴把矩形和拆成四塊相加相減。\n\n## 典型讀題訊號\n\n- 子陣列和可以為正也可以為負，滑窗失去單調性。\n- 題目要求和等於 K、和能被 K 整除、奇偶數量剛好 K、平衡 0/1。\n- 需要統計以前有多少狀態與目前狀態配對。\n- 矩陣中反覆查矩形和。\n\n\n## C++ 模板或偽程式\n\n```cpp\nlong long countSubarraySum(vector<int>& nums, long long target) {\n    unordered_map<long long, long long> freq;\n    freq[0] = 1;\n    long long prefix = 0, ans = 0;\n    for (int x : nums) {\n        prefix += x;\n        ans += freq[prefix - target];\n        ++freq[prefix];\n    }\n    return ans;\n}\n```\n\n## 常見錯誤\n\n- 忘記先放空前綴 freq[0]=1。\n- 查答案與加入目前前綴的順序反了，會把空子陣列算進去。\n- C++ 負數取模仍可能是負的。\n- 二維前綴常錯在 +1 偏移與矩形邊界。\n\n## 建議練習順序\n\n- 必修：560、974、1248。\n- 進階：1590、2488、3026。\n- 挑戰：1074、1915、2025。\n\n## 我能認出這個模式嗎？\n\n- 我能寫出子陣列條件對應的 prefix[j]-prefix[i] 嗎？\n- 固定右端時，需要查以前的哪個前綴？\n- map 裡要存頻次、最早下標、最小前綴，還是多個狀態？\n- 是否需要處理負餘數或空前綴？",
  },
  93007: {
    title: "答案二分搜尋",
    description:
      "不直接構造答案，而是先猜一個值 x，再用 check(x) 判斷它是否可行。只要可行性具有單調性，就能靠二分不斷縮小範圍逼近答案。",
    overview:
      "## 涵蓋主題\n\n以下每個子主題皆有獨立說明頁；建議依序閱讀後，再進入「搭配追蹤題單」練習。\n\n\n## 初學者先懂什麼\n\n答案二分搜尋用在答案本身是一個數值，而且「候選值變大或變小後，可行性會保持同一方向」的問題。最小化最大值通常找第一個可行值；最大化最小值通常找最後一個可行值。真正的難點不是二分，而是設計 check(x)。\n\n## 核心直覺\n\n如果 x 可行，而所有比 x 更寬鬆的值也可行，就有單調性。二分只負責找邊界；check(x) 需要用貪心、計數或一次掃描回答「用這個限制能不能完成」。\n\n## 典型讀題訊號\n\n- 題目問最小的最大值、最大的最小值、最少時間、最小速度、最小容量。\n- 直接構造最佳值困難，但驗證某個值很容易。\n- 限制值在大範圍整數內，O(log answer * check) 可接受。\n\n\n## C++ 模板或偽程式\n\n```cpp\nlong long firstTrue(long long left, long long right) {\n    while (left < right) {\n        long long mid = left + (right - left) / 2;\n        if (check(mid)) right = mid;\n        else left = mid + 1;\n    }\n    return left;\n}\n\nlong long lastTrue(long long left, long long right) {\n    while (left < right) {\n        long long mid = left + (right - left + 1) / 2;\n        if (check(mid)) left = mid;\n        else right = mid - 1;\n    }\n    return left;\n}\n```\n\n## 常見錯誤\n\n- check(x) 沒有單調性卻硬二分。\n- 右邊界不包含答案。\n- first true 與 last true 的 mid 偏移混用。\n- 計數相乘或累加忘記 long long。\n\n## 建議練習順序\n\n- 必修：410、875、1482、1552。\n- 進階：1760、1870、2187、2517。\n- 挑戰：2616、2861。\n\n## 我能認出這個模式嗎？\n\n- 候選答案 x 變大時，題目是更容易還是更難？\n- 我要找 first true 還是 last true？\n- check(x) 是否只回傳可行/不可行，不偷算答案？\n- left/right 是否保證包住答案？",
  },
  93008: {
    title: "堆積貪心",
    description:
      "用 priority_queue 隨時保存當前最佳候選，必要時才取用，或反悔換掉先前最差的決定。它的核心是每一步都安全地取出最大或最小值。",
    overview:
      "## 涵蓋主題\n\n以下每個子主題皆有獨立說明頁；建議依序閱讀後，再進入「搭配追蹤題單」練習。\n\n\n## 初學者先懂什麼\n\n堆積適合「每一步都要從目前候選中取最大或最小」的題目。貪心的核心是定義候選集合與反悔規則：先把可能有用的東西放進堆，真正遇到瓶頸時才拿出最好的，或先做決定，發現資源超量時把最差的決定換掉。\n\n## 核心直覺\n\n如果未來只在乎目前候選中的最大值或最小值，堆積就能讓每次選擇 O(log n)。局部最優能成立通常因為交換論證：把昂貴資源留給更大的缺口，或把最短/最高優先級任務先處理，不會讓後續更差。\n\n## 典型讀題訊號\n\n- 反覆取目前最大/最小。\n- 資源有限，需要必要時才使用。\n- 任務有到達時間、處理時間、房間、伺服器等優先級。\n- 刪除或更新造成堆裡可能有舊資料。\n\n\n## C++ 模板或偽程式\n\n```cpp\npriority_queue<int> best;\nfor (auto event : events) {\n    while (can_add_candidate(event)) best.push(candidate_value);\n    if (need_help()) {\n        if (best.empty()) return -1;\n        use(best.top());\n        best.pop();\n    }\n}\n```\n\n## 常見錯誤\n\n- 堆中元素語意不清：到底是候選、已選、還是可反悔項目。\n- min-heap/max-heap 選反。\n- 更新資料後忘記處理 stale entry。\n- 貪心沒有單調或交換理由，只是看起來合理。\n\n## 建議練習順序\n\n- 必修：1642、871、2530。\n- 進階：1834、1882、2402、3066。\n- 挑戰：2163。\n\n## 我能認出這個模式嗎？\n\n- 我需要每次取最大還是最小？\n- 堆裡保存的是候選還是已分配資源？\n- 何時把元素放進堆、何時拿出來？\n- 如果資料會更新，堆頂是否需要驗證過期？",
  },
  93009: {
    title: "區間與掃描線",
    description:
      "先把區間端點排序成一連串事件，再依序維護覆蓋數、重疊數或活躍集合。這套思路可以涵蓋合併區間、會議室與差分等題型。",
    overview:
      "## 涵蓋主題\n\n以下每個子主題皆有獨立說明頁；建議依序閱讀後，再進入「搭配追蹤題單」練習。\n\n\n## 初學者先懂什麼\n\n區間題的第一步通常是排序。合併區間要按左端點排序；選最多不重疊區間常按右端點排序；查詢每個點被哪些區間覆蓋，則把左右端點拆成事件掃描。掃描線的狀態是「目前活著的區間」。\n\n## 核心直覺\n\n排序後，區間的相對關係變得局部：下一個區間只需要和目前合併段、目前活躍集合或目前最早結束者互動。差分事件把很多區間加減轉成在端點處變化。座標很大但事件很少時，先壓縮座標。\n\n## 典型讀題訊號\n\n- 會議、預訂、工作日、天數覆蓋、最少分組。\n- 需要最大同時存在數、合併後長度、未覆蓋區間。\n- 查詢點與區間配對，或需要隨掃描維護最短/最小活躍區間。\n\n\n## C++ 模板或偽程式\n\n```cpp\nvector<pair<int,int>> events;\nfor (auto [l, r] : intervals) {\n    events.push_back({l, 1});\n    events.push_back({r + 1, -1}); // closed interval\n}\nsort(events.begin(), events.end());\nint active = 0, best = 0;\nfor (auto [x, delta] : events) {\n    active += delta;\n    best = max(best, active);\n}\n```\n\n## 常見錯誤\n\n- 閉區間與半開區間混淆。\n- 同一座標 start/end 處理順序錯。\n- 按左端或右端排序的目的不清。\n- 座標 r+1 可能溢位，要用 long long 或事件排序 tie-break。\n\n## 建議練習順序\n\n- 必修：56、1094、2406。\n- 進階：1288、1943、2054、3169。\n- 挑戰：1851、2589。\n\n## 我能認出這個模式嗎？\n\n- 這題是在合併區間、數重疊，還是回答查詢？\n- 端點是閉區間還是半開區間？\n- 我應該按左端、右端，還是拆事件排序？\n- 是否需要活躍集合或座標壓縮？",
  },
  93010: {
    title: "單調堆疊與單調佇列",
    description:
      "維護一個單調遞增或遞減的候選集合，當新元素到來時就彈出被它支配的舊元素。常用來求下一個更大或更小值，以及視窗極值。",
    overview:
      "## 涵蓋主題\n\n以下每個子主題皆有獨立說明頁；建議依序閱讀後，再進入「搭配追蹤題單」練習。\n\n\n## 初學者先懂什麼\n\n單調性表示資料在結構內保持遞增或遞減。單調堆疊多用來找某元素左/右第一個更大或更小；單調佇列多用在下標會過期的視窗或前綴最佳值。元素能被彈出，是因為新元素在值與位置上都比它更有競爭力。\n\n## 核心直覺\n\n如果一個舊候選比新候選差，而且新候選更靠近未來，它就永遠不會再成為最佳答案。類凸性轉移可以先理解為：DP 轉移裡有一批候選，但它們的優劣順序會隨 i 單調移動，因此可以用 deque 保留可能最佳的少數候選。\n\n## 典型讀題訊號\n\n- 找下一個更大/更小、前一個更大/更小。\n- 固定視窗最大值或最小值。\n- 含負數的最短子陣列不能滑窗，但前綴和可用 deque。\n- DP 轉移要從一段候選中取最優，且候選會過期或被支配。\n\n\n## C++ 模板或偽程式\n\n```cpp\ndeque<int> dq;\nfor (int i = 0; i < n; ++i) {\n    while (!dq.empty() && dq.front() <= i - k) dq.pop_front();\n    while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();\n    dq.push_back(i);\n    if (i >= k - 1) ans.push_back(nums[dq.front()]);\n}\n```\n\n## 常見錯誤\n\n- 忘記存下標，導致無法判斷距離或過期。\n- 重複值比較用 < 還是 <= 沒有統一，貢獻法會重複計算。\n- deque 隊首過期未移除。\n- 把單調堆疊和單調佇列混用：前者不處理過期，後者要處理視窗邊界。\n\n## 建議練習順序\n\n- 必修：739、239、901。\n- 進階：862、907、1673、2104。\n- 挑戰：2945。\n\n## 我能認出這個模式嗎？\n\n- 我要找更大還是更小？往左找還是往右找？\n- 結構內要保持遞增還是遞減？\n- 元素被彈出後，為什麼未來不需要它？\n- 是否有視窗長度或下標過期條件？",
  },
  93011: {
    title: "圖論：BFS / 0-1 BFS / Dijkstra",
    description:
      "把網格或操作過程建模成一張狀態圖，再依邊權選擇演算法。邊權全為 1 時用 BFS，只有 0 或 1 時用 0-1 BFS，非負權重則用 Dijkstra。",
    overview:
      "## 涵蓋主題\n\n以下每個子主題皆有獨立說明頁；建議依序閱讀後，再進入「搭配追蹤題單」練習。\n\n\n## 初學者先懂什麼\n\n圖建模就是決定「節點代表什麼狀態，邊代表什麼操作」。在網格中，節點可以是 (row, col)，但如果題目有剩餘可消除障礙、目前時間、mask 或上一個方向，這些也可能是狀態的一部分。\n\n## 核心直覺\n\n邊權全是 1 時，BFS 按層擴展，第一次到達就是最短。邊權只有 0/1 時，0-1 BFS 用 deque：0 成本放前面，1 成本放後面。邊權是任意非負數時，用 Dijkstra。priority_queue 可能保留舊距離，取出時若 cost != dist[state] 就是過期項目，必須跳過。\n\n## 典型讀題訊號\n\n- 網格移動、最少步數、最小代價、最小時間。\n- 每一步代價全為 1、只有 0/1，或是非負權重。\n- visited 不能只看位置，還要看剩餘資源或時間條件。\n\n\n## C++ 模板或偽程式\n\n```cpp\npriority_queue<State, vector<State>, greater<State>> pq;\ndist[start] = 0;\npq.push({0, start});\nwhile (!pq.empty()) {\n    auto [cost, state] = pq.top();\n    pq.pop();\n    if (cost != dist[state]) continue;\n    for (auto [next, w] : neighbors(state)) {\n        if (cost + w < dist[next]) {\n            dist[next] = cost + w;\n            pq.push({dist[next], next});\n        }\n    }\n}\n```\n\n## 常見錯誤\n\n- visited 狀態缺少剩餘資源，導致把不同狀態錯當同一格。\n- 0-1 BFS 邊權為 0 時沒有 push_front。\n- Dijkstra 沒跳過 stale entry，造成重複擴展或錯誤。\n- 網格邊界、起點終點障礙、時間奇偶等待處理錯。\n\n## 建議練習順序\n\n- 必修：1091、1926、1368、1631。\n- 進階：1293、2290、2812。\n- 挑戰：2577。\n\n## 我能認出這個模式嗎？\n\n- 節點狀態除了位置還需要哪些資訊？\n- 邊權是 1、0/1，還是任意非負？\n- 第一次到達是否一定最短？\n- priority_queue 取出時是否檢查過期項目？",
  },
  93012: {
    title: "動態規劃",
    description:
      "用狀態記住處理到目前為止的最佳答案，轉移則描述最後一步是怎麼來的。最終目的是把重複的選擇樹壓縮成一張表或少數幾個變數。",
    overview:
      "## 涵蓋主題\n\n以下每個子主題皆有獨立說明頁；建議依序閱讀後，再進入「搭配追蹤題單」練習。\n\n\n## 初學者先懂什麼\n\nDP 狀態是一句精確定義，例如 dp[i] 表示處理前 i 個物件後的最大值。轉移就是最後一步如何來：選目前、跳過目前、結束一段、延續一段。初學者不要先背公式，要先把暴力遞迴的重複子問題說出來。\n\n## 核心直覺\n\n當未來只需要知道過去的少數摘要，而不需要完整路徑，就能 DP。選或不選是最常見模型；至多 K 個選擇多一維 k；不重疊子陣列需要狀態表示目前是否在一段中。狀態壓縮則是發現轉移只依賴前一層或少數變數。\n\n## 典型讀題訊號\n\n- 每個元素或區間可選可不選。\n- 要求最多 K 個、剛好 K 段、不重疊。\n- 排序後找上一個相容物件。\n- 轉移需要查歷史最佳值，可能用 map、heap、Fenwick tree 優化。\n\n\n## C++ 模板或偽程式\n\n```cpp\nlong long robLike(vector<int>& a) {\n    long long skip = 0, take = 0;\n    for (int x : a) {\n        long long ntake = skip + x;\n        long long nskip = max(skip, take);\n        take = ntake;\n        skip = nskip;\n    }\n    return max(skip, take);\n}\n```\n\n## 常見錯誤\n\n- dp[i] 定義含糊，導致轉移互相矛盾。\n- 初始化不可能狀態為 0，讓非法方案參與轉移。\n- k 維度倒序/正序更新錯。\n- 不重疊問題忘記找相容前狀態。\n\n## 建議練習順序\n\n- 必修：198、2140、1235。\n- 進階：689、1751、2320、2830、3186。\n- 挑戰：3077。\n\n## 我能認出這個模式嗎？\n\n- dp 狀態代表處理到哪裡、用了多少資源、是否在段內？\n- 最後一步是選、跳過、開始段、還是結束段？\n- 轉移依賴哪些舊狀態？能壓縮嗎？\n- 是否有不可能狀態需要 -INF？",
  },
  93013: {
    title: "貢獻法",
    description:
      "換個視角，計算每個元素被多少子陣列使用，再由它的前後邊界算出現次數 L×R。如此就能避開列舉所有子陣列的平方級工作量。",
    overview:
      "## 涵蓋主題\n\n以下每個子主題皆有獨立說明頁；建議依序閱讀後，再進入「搭配追蹤題單」練習。\n\n\n## 初學者先懂什麼\n\n貢獻法把視角從「每個子陣列算一次」換成「每個元素被多少子陣列使用」。如果某元素左邊有 L 種起點、右邊有 R 種終點，那它對答案的出現次數通常是 L*R。難點是找出它在哪些範圍內扮演唯一字元、最小值或最大值。\n\n## 核心直覺\n\n所有子陣列數量是 O(n^2)，但每個元素的有效邊界可用前後出現位置或單調堆疊在 O(n) 找到。前後出現位置處理「唯一」或「第一次/最後一次」；前後更小/更大處理「最小值/最大值」。\n\n## 典型讀題訊號\n\n- 題目問所有子陣列/子字串的總和。\n- 答案可拆成每個元素、字元或數值的影響。\n- 需要計算某元素作為唯一字元、最小值、最大值的次數。\n\n\n## C++ 模板或偽程式\n\n```cpp\n// nums[i] as minimum: previous strictly less, next less or equal\nlong long contribution = 1LL * (i - prevLess[i]) * (nextLessEq[i] - i) * nums[i];\n```\n\n## 常見錯誤\n\n- 重複值 tie-break 不一致，造成重複歸屬或漏算。\n- 左右距離少算 1。\n- 貢獻值乘法溢位，需 long long。\n- 把每個子陣列枚舉後再優化，錯過換視角的機會。\n\n## 建議練習順序\n\n- 必修：828、907、2104。\n- 進階：1856、2262、2681。\n- 挑戰：2916、3428。\n\n## 我能認出這個模式嗎？\n\n- 答案能否拆成每個元素的加總？\n- 每個元素的左邊界和右邊界由什麼決定？\n- 重複值要歸給左邊還是右邊？\n- 次數是否是 leftChoices * rightChoices？",
  },
  93014: {
    title: "位元技巧",
    description:
      "利用 AND、OR、XOR 的代數性質來解題：OR 或 AND 子陣列產生的不同值通常很少，而且可以用整數 mask 壓縮集合狀態。",
    overview:
      "## 涵蓋主題\n\n以下每個子主題皆有獨立說明頁；建議依序閱讀後，再進入「搭配追蹤題單」練習。\n\n\n## 初學者先懂什麼\n\n位元操作包含 &, |, ^, ~, <<, >>。OR 只會把 bit 從 0 變 1；AND 只會把 bit 從 1 變 0；XOR 則是翻轉，沒有單調性。這三者的差異決定解法：OR/AND 子陣列的不同值通常很少，XOR 則常用前綴 XOR 或 trie。\n\n## 核心直覺\n\n對固定右端點，把所有以它結尾的子陣列 OR 值存成集合。每往左多加一個數，OR 的 bit 只能增加，因此不同結果最多約 32 個；AND 同理只能減少。有限 mask 狀態適合字母種類少、集合小、奇偶性小的題目。bitset 則可把一排布林 DP 壓成機器位元並批次位移。\n\n## 典型讀題訊號\n\n- 題目直接出現 AND、OR、XOR、mask、子集。\n- 數值範圍在 2^20 以內或字母種類很少。\n- 需要維護子陣列位元值、前綴 XOR、可達集合。\n\n\n## C++ 模板或偽程式\n\n```cpp\nunordered_map<int, long long> cur, next;\nfor (int x : nums) {\n    next.clear();\n    next[x]++;\n    for (auto [value, cnt] : cur) next[value | x] += cnt;\n    cur.swap(next);\n    // cur contains compressed OR states ending here\n}\n```\n\n## 常見錯誤\n\n- 把 XOR 當成 OR/AND 一樣單調。\n- mask 位數超過 int 範圍，1<<bit 溢位。\n- AND 初始值錯，應由第一個元素開始或用全 1。\n- 滑窗維護 OR 時忘記 bit 頻次。\n\n## 建議練習順序\n\n- 必修：1863、2433、898、1442。\n- 進階：2044、2411、2564、3209。\n- 挑戰：1521、3277。\n\n## 我能認出這個模式嗎？\n\n- 這題是 OR、AND 還是 XOR？它是否單調？\n- 狀態值數量是否被 bit 數限制？\n- mask 需要多少位，會不會溢位？\n- 能否用前綴 XOR 或 bitset 批次處理？",
  },
  93015: {
    title: "資料結構設計",
    description:
      "把每個操作拆成更新與查詢兩種需求，先設定一份權威狀態，再為查詢建立索引。實作上常搭配延遲刪除，同時維護多個視角。",
    overview:
      "## 涵蓋主題\n\n以下每個子主題皆有獨立說明頁；建議依序閱讀後，再進入「搭配追蹤題單」練習。\n\n\n## 初學者先懂什麼\n\n資料結構設計題不是考某個容器名稱，而是考你能否為每個操作建立「權威狀態」與「查詢索引」。權威狀態保存真實資料；索引用來快速回答最大、最小、某類別第一名、某時間版本等問題。\n\n## 核心直覺\n\n更新常會讓舊索引失效。直接從 heap 或 set 中刪除舊資料可能昂貴或麻煩，所以常採用延遲刪除：允許舊資料留在索引裡，但查詢前檢查它是否仍符合權威狀態。若查詢需要排序，就用有序集合或二分陣列；若查詢需要頻次，就維護 count map。\n\n## 典型讀題訊號\n\n- 多次 update/query 交錯。\n- 依分類找最高、最低、最新或第 k 個。\n- 需要支援改值、刪除、歷史版本、索引查找。\n- heap 裡可能出現舊分數或舊時間。\n\n\n## C++ 模板或偽程式\n\n```cpp\nunordered_map<string, int> current;\npriority_queue<Entry> heap;\n\nvoid update(string id, int score) {\n    current[id] = score;\n    heap.push({score, id});\n}\n\nEntry query() {\n    while (!heap.empty() && current[heap.top().id] != heap.top().score) {\n        heap.pop();\n    }\n    return heap.top();\n}\n```\n\n## 常見錯誤\n\n- 沒有定義 source of truth，導致多份資料互相矛盾。\n- 更新後忘記讓索引同步或查詢時驗證。\n- 操作複雜度只看平均，忽略最壞或總攤還。\n- 字串 tie-break、時間版本邊界、二分位置處理錯。\n\n## 建議練習順序\n\n- 必修：981、1146、2349。\n- 進階：2034、2353、2502。\n- 挑戰：1912、2102、3408，練多索引、有序集合與延遲刪除。\n\n## 我能認出這個模式嗎？\n\n- 每個操作需要讀寫哪些資訊？\n- 哪一份資料是權威狀態？\n- 查詢需要最大/最小、排序、頻次還是版本？\n- 索引可能過期嗎？如果會，如何驗證？",
  },
};
export function overviewSectionId(topicId: number): number {
  return topicId * 100;
}

export function subtopicSectionId(topicId: number, index: number): number {
  return topicId * 100 + index + 1;
}

export function practiceSectionId(topicId: number): number {
  return topicId * 10 + 9;
}

export function buildPatternSection(
  topicId: number,
  title: string,
  description: string,
  overview: string,
  withTopicPractice: (summary: string, topicId: number) => string,
): TutorialData.Section {
  const subtopics = Q3_SUBTOPICS[topicId] ?? [];
  return {
    id: topicId,
    title,
    description,
    summary: `## 章節導覽\n\n本模式共有 ${subtopics.length} 個子主題講義，外加「搭配追蹤題單」。建議先讀「模式總覽」，再依序閱讀子主題，最後練題。`,
    children: [
      {
        id: overviewSectionId(topicId),
        title: "模式總覽",
        description: "本模式的整體直覺、讀題訊號、模板與常見錯誤。",
        summary: overview,
      },
      ...subtopics.map((st, index) => ({
        id: subtopicSectionId(topicId, index),
        title: st.title,
        description: st.blurb,
        summary: st.summary,
      })),
      {
        id: practiceSectionId(topicId),
        title: "搭配追蹤題單",
        description: "依必修、進階、挑戰三階段練習本模式，並在題表記錄進度。",
        summary: withTopicPractice(
          "## 如何使用本題單\n\n先讀「模式總覽」與各子主題講義，再用下面三張題表依序練習。每題的 Labels 會標出對應的子主題，方便對照講義。",
          topicId,
        ),
      },
    ],
  };
}
