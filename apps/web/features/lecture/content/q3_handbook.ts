import type { TutorialData } from "@/types";
import {
  buildPatternSection,
  Q3_PATTERN_META,
  Q3_PATTERN_TOPIC_IDS,
} from "./q3_subtopics";
import q3HandbookPractice from "@/public/studyplan/q3_handbook.json";

const problemTableHeader =
  "| ID | Problem | Rating | Labels |\n| --- | --- | --- | --- |";

type PracticeProblem = {
  id: string | number;
  title: string;
  slug: string;
  src?: string;
  score?: number | null;
  subsection?: string | null;
};

type PracticeSection = {
  id: number;
  children?: PracticeSection[];
  problems?: PracticeProblem[];
};

const practiceSections = q3HandbookPractice.children as PracticeSection[];

function findPracticeSection(sectionId: number): PracticeSection | undefined {
  const stack = [...practiceSections];
  while (stack.length > 0) {
    const section = stack.pop()!;
    if (section.id === sectionId) {
      return section;
    }
    if (section.children) {
      stack.push(...section.children);
    }
  }
  return undefined;
}

function problemToTableRow(problem: PracticeProblem) {
  const href = problem.src ?? `https://leetcode.cn/problems/${problem.slug}/`;
  const rating =
    typeof problem.score === "number"
      ? Math.round(problem.score).toString()
      : "";
  return `| ${problem.id} | [${problem.title}](${href}) | ${rating} | ${problem.subsection ?? ""} |`;
}

function practiceRowsForSection(sectionId: number) {
  return findPracticeSection(sectionId)?.problems?.map(problemToTableRow) ?? [];
}

function stageTable(label: string, sectionId: number) {
  const rows = practiceRowsForSection(sectionId);
  if (rows.length === 0) return "";
  return `**${label}**\n${problemTableHeader}\n${rows.join("\n")}`;
}

function withTopicPractice(summary: string, topicId: number) {
  const intro =
    "## 搭配追蹤題單\n\n完成下面的追蹤題表，就能直接在本頁記錄每題的進度並貼上解法；題目分成必修、進階、挑戰三組，建議依序練習。";
  const tables = [
    stageTable("必修", topicId * 10 + 1),
    stageTable("進階", topicId * 10 + 2),
    stageTable("挑戰", topicId * 10 + 3),
  ].filter(Boolean);
  return `${summary}\n\n${intro}\n\n${tables.join("\n\n")}`;
}

export const q3Handbook = {
  id: 930,
  title: "LeetCode 競賽 Q3 手冊：第三題模式訓練",
  description:
    "把 Q3 常見模式講義與精選追蹤題單整合成同一套章節：每個模式拆成多個子主題講義，再搭配可追蹤題表練習。",
  src: null,
  last_update: "2026-06-18T00:00:00.000Z",
  summary:
    "# LeetCode 競賽 Q3 手冊\n\n這份手冊把 Q3 模式說明與可追蹤題單整合在同一套章節。每個模式章節先提供總覽，再拆成多個「涵蓋主題」子頁逐一說明概念、直覺、作法與常見錯誤，最後用可追蹤的題目表安排必修、進階與挑戰題。\n\n## 使用方式\n\n1. 先讀「Q3 解題流程與模式識別」。\n2. 選一個模式章節，讀完總覽後依序進入各子主題講義。\n3. 讀完子主題後，進入「搭配追蹤題單」完成必修題，再進入進階與挑戰題。\n4. 每題完成後記錄進度；如果做錯，補一句「下次看到什麼訊號要想到這個模式」。\n\n## Q3 的核心判斷\n\nQ3 通常不是要求你硬寫更長的程式，而是要求你把暴力法中的重複工作換成一個可維護的結構：視窗、前綴、二分答案、堆、掃描線、單調結構、最短路、DP、貢獻法、位元壓縮或設計型資料結構。",
  children: [
    {
      id: 93100,
      title: "1. Q3 解題流程與模式識別",
      summary:
        "## 從暴力法開始\n\n開題後先用一句話寫出暴力法：我枚舉什麼？如何判斷合法？答案是計數、最大化還是最小化？接著看哪一步重複到無法承受。這個重複工作通常就是模式訊號。\n\n## 三分鐘檢查\n\n- 連續子陣列或子字串：先想滑動視窗、前綴和、單調佇列或貢獻法。\n- 最小化最大值、最大化最小值、最少時間：先檢查答案二分。\n- 每步要取目前最大/最小，或資源可以反悔：先想堆積貪心。\n- 區間、會議、覆蓋、天數：先想排序、掃描線與差分事件。\n- 網格或狀態移動：先判斷邊權是 1、0/1 還是非負，再選 BFS、0-1 BFS 或 Dijkstra。\n- 選或不選、最多 K 個、不重疊：先定義 DP 狀態。\n- 所有子陣列/子字串總和：先想每個元素的貢獻。\n- AND/OR/XOR/mask：先想位元狀態是否有限。\n\n## 何時換方向\n\n如果 8 到 12 分鐘後仍說不出不變式、check(x) 單調性、DP 狀態或圖狀態，先停下來重讀限制。Q3 最常見的失敗不是少寫一行程式，而是把題目放進錯誤模型。",
    },
    {
      id: 93200,
      title: "2. Q3 核心模式與追蹤題單",
      summary:
        "以下每個模式章節先提供總覽，再拆成多個子主題講義頁；讀完子主題後，進入「搭配追蹤題單」依「必修 -> 進階 -> 挑戰」練習。",
      children: Q3_PATTERN_TOPIC_IDS.map((topicId) => {
        const meta = Q3_PATTERN_META[topicId];
        return buildPatternSection(
          topicId,
          meta.title,
          meta.description,
          meta.overview,
          withTopicPractice,
        );
      }),
    },
    {
      id: 93400,
      title: "3. 兩週 Q3 練習安排",
      summary:
        "## 第一週：連續資料與最佳化\n\n- Day 1：滑動視窗必修題，重點是說清楚 left/right 的移動理由。\n- Day 2：前綴和與雜湊表必修題，重點是空前綴、查詢順序與模數。\n- Day 3：答案二分必修題，重點是 first true / last true。\n- Day 4：堆積貪心必修題，重點是堆裡到底放候選還是已選資源。\n- Day 5：區間與掃描線必修題，重點是端點開閉與排序目的。\n- Day 6：混合計時三題，每題 35 分鐘。\n- Day 7：重做錯題，補模式訊號筆記。\n\n## 第二週：狀態、轉移與高頻技巧\n\n- Day 8：單調堆疊與單調佇列。\n- Day 9：圖論 BFS / 0-1 BFS / Dijkstra。\n- Day 10：動態規劃。\n- Day 11：貢獻法。\n- Day 12：位元技巧。\n- Day 13：資料結構設計。\n- Day 14：挑戰題與最近失敗 Q3 復盤。\n\n每一天只要求一件事：做完題後能用一句話說出「這題的模式訊號與核心不變式」。",
    },
  ],
} satisfies TutorialData.Root;
