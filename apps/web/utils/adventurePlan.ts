import type { StudyPlanData } from "@/types";

import {
  ADVENTURE_TOPICS,
  PROBLEM_HOMES,
  MIN_STAGE_SIZE,
  MISC_SECTIONS,
  SOURCE_LABELS,
  SOURCE_TOPIC_OVERRIDES,
  SPLIT_TARGET,
  SPLIT_THRESHOLD,
  type TopicConfig,
  type TopicKey,
} from "./adventureTaxonomy";

/**
 * 冒險路線: the problems of the five self-authored plans (面試衝刺、技術面試、
 * Q3／Q4 手冊、1700→2100), each placed once in 靈茶山艾府's topic → chapter →
 * section taxonomy, with the plans' teaching prose moved to the matching
 * topic. Generated into public/studyplan/adventure.json by
 * scripts/buildAdventurePlan.ts; edit the config or the sources, not the JSON.
 */

/** Old plans, in the order their labels and prose are listed. */
export const ADVENTURE_SOURCE_KEYS = [
  "interview_sprint",
  "technical_interview",
  "q3_handbook",
  "rating_2100",
  "q4_handbook",
] as const;

export type AdventureSourceKey = (typeof ADVENTURE_SOURCE_KEYS)[number];

export const ADVENTURE_TITLE = "冒險路線：靈茶分類精選";

export const ADVENTURE_SUMMARY = [
  "把原本五份自建題單（面試衝刺、技術面試、競賽 Q3／Q4 手冊、1700 → 2100 進階衝刺）的題目合在一起，依**靈茶山艾府的分類**重新排列：主題 → 大章 → 小節。",
  "",
  "- 每題只出現一次；題目下方的標籤註明它原本出自哪份題單（例如「Q3 必修」「1700→2100 階段2」）。",
  "- 每個主題開頭的「導讀」收錄原題單對應的講解，完整觀念與模板請見同名講義。",
  "- 和靈茶不同的地方：「其他／雜項」的題目已移到更具體的小節；貪心的「思維題」重新分組；題目太多的小節依難度拆成基礎／進階／挑戰。",
  "- 進度依題號記錄，原本在舊題單打勾的題目會直接帶過來。想要玩法？打開「破關模式」，每個小節就是一道關卡。",
].join("\n");

const NUMERIC_PREFIX_RE = /^\s*\d+(?:\.\d+)*\.?\s*/;

export function stripNumericPrefix(title: string): string {
  return title.replace(NUMERIC_PREFIX_RE, "").trim() || title.trim();
}

function topNumber(title: string): number | null {
  const match = title.match(/^\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

// ---------------------------------------------------------------------------
// Inputs and report
// ---------------------------------------------------------------------------

export interface AdventureSource {
  key: AdventureSourceKey;
  /** Source plan with its 講義 prose folded in. */
  root: StudyPlanData.Root;
  /** Root-level prose of the source plan. */
  summary?: string;
}

export interface AdventureInput {
  topics: Record<TopicKey, StudyPlanData.Root>;
  sources: AdventureSource[];
  /** Library ratings by problem id, used for ordering and difficulty splits. */
  ratings: Record<string, number | undefined>;
}

export interface AdventureReport {
  /** Topic chosen for each source section that carries problems or prose. */
  sourceTopics: { source: string; section: string; topic: TopicKey | null }[];
  /** Misc problems we couldn't move anywhere more specific. */
  miscUnresolved: { id: string; title: string; topic: TopicKey }[];
  /** Problems not in any 0x3F 題單 (placed in the topic's 補充題). */
  notIn0x3F: { id: string; title: string; topic: TopicKey }[];
  problemCount: number;
}

// ---------------------------------------------------------------------------
// 0x3F index
// ---------------------------------------------------------------------------

interface Leaf {
  topic: TopicKey;
  top: number;
  section: StudyPlanData.Section;
  /** Display name: the leaf title, prefixed by its parent when nested. */
  name: string;
  misc: boolean;
}

interface Placement {
  leaf: Leaf;
  /** Position in 0x3F order, for stable ordering. */
  order: number;
}

function collectLeaves(
  section: StudyPlanData.Section,
  out: StudyPlanData.Section[] = [],
): StudyPlanData.Section[] {
  if ((section.problems?.length ?? 0) > 0) out.push(section);
  for (const child of section.children ?? []) collectLeaves(child, out);
  return out;
}

/** Leaves of a 0x3F top-level section with names that stand on their own. */
function namedLeaves(
  top: StudyPlanData.Section,
): { section: StudyPlanData.Section; name: string }[] {
  const out: { section: StudyPlanData.Section; name: string }[] = [];
  const walk = (section: StudyPlanData.Section, parent: string | null) => {
    const own = stripNumericPrefix(section.title);
    if ((section.problems?.length ?? 0) > 0) {
      // 「4.1.1 基礎」 under 「4.1 最長公共子序列（LCS）」 → LCS・基礎.
      out.push({ section, name: parent ? `${parent}・${own}` : own });
    }
    for (const child of section.children ?? []) {
      walk(child, section === top ? null : own);
    }
  };
  walk(top, null);
  return out;
}

function indexTopics(topics: AdventureInput["topics"]) {
  const placements = new Map<string, Placement[]>();
  const leavesByTop = new Map<string, Leaf[]>();
  let order = 0;
  for (const config of ADVENTURE_TOPICS) {
    const root = topics[config.key];
    if (!root) continue;
    const misc = new Set(MISC_SECTIONS[config.key] ?? []);
    for (const top of root.children) {
      const number = topNumber(top.title);
      if (number === null) continue;
      const leaves = namedLeaves(top).map(({ section, name }) => ({
        topic: config.key,
        top: number,
        section,
        name,
        misc: misc.has(number),
      }));
      leavesByTop.set(`${config.key}:${number}`, leaves);
      for (const leaf of leaves) {
        for (const problem of leaf.section.problems ?? []) {
          const id = problem.id?.toString();
          if (!id) continue;
          const list = placements.get(id) ?? [];
          list.push({ leaf, order: order++ });
          placements.set(id, list);
        }
      }
    }
  }
  return { placements, leavesByTop };
}

// ---------------------------------------------------------------------------
// Source topics
// ---------------------------------------------------------------------------

const TOPIC_KEYWORDS: [TopicKey, RegExp][] = [
  // Checked first: 「高階 DP 與單調性優化」 is about DP, not monotonic stacks.
  ["dynamic_programming", /動態規劃|DP/],
  ["sliding_window", /滑動視窗|雙指標/],
  ["binary_search", /二分/],
  ["monotonic_stack", /單調/],
  ["grid", /網格/],
  ["bitwise_operations", /位元/],
  ["graph", /圖論|最短路|BFS|Dijkstra/],
  ["data_structure", /資料結構|前綴和|堆積|線段樹|樹狀陣列/],
  ["math", /數學|數論/],
  ["greedy", /貪心/],
  ["string", /字串/],
  ["trees", /樹和二元樹|二元樹|樹上/],
];

const TOPIC_ORDER = new Map(ADVENTURE_TOPICS.map((t, i) => [t.key, i]));

function keywordTopic(title: string): TopicKey | null {
  for (const [topic, re] of TOPIC_KEYWORDS) if (re.test(title)) return topic;
  return null;
}

function descendantIds(section: StudyPlanData.Section): string[] {
  return collectLeaves(section).flatMap((leaf) =>
    (leaf.problems ?? []).map((p) => p.id?.toString()).filter(Boolean),
  ) as string[];
}

/** Majority topic of a section's problems (ties go to 靈茶 order). */
function voteTopic(
  ids: string[],
  placements: Map<string, Placement[]>,
): TopicKey | null {
  const votes = new Map<TopicKey, number>();
  for (const id of ids) {
    const topics = new Set((placements.get(id) ?? []).map((p) => p.leaf.topic));
    for (const topic of topics) votes.set(topic, (votes.get(topic) ?? 0) + 1);
  }
  let best: TopicKey | null = null;
  for (const [topic, count] of votes) {
    if (
      best === null ||
      count > votes.get(best)! ||
      (count === votes.get(best)! &&
        TOPIC_ORDER.get(topic)! < TOPIC_ORDER.get(best)!)
    ) {
      best = topic;
    }
  }
  return best;
}

interface SourceSection {
  source: AdventureSourceKey;
  section: StudyPlanData.Section;
  /** Titles from the source's top level down to this section. */
  path: string[];
  topic: TopicKey | null;
}

/**
 * The topic each source section is about: a title keyword, else its
 * parent's topic, else the majority topic of its problems.
 */
function resolveSourceTopics(
  sources: AdventureSource[],
  placements: Map<string, Placement[]>,
): SourceSection[] {
  const out: SourceSection[] = [];
  for (const source of sources) {
    const overrides = SOURCE_TOPIC_OVERRIDES[source.key] ?? {};
    const walk = (
      section: StudyPlanData.Section,
      path: string[],
      inherited: TopicKey | null,
    ) => {
      const fullPath = [...path, section.title];
      const ids = descendantIds(section);
      // A Q3 pattern's 必修／進階／挑戰 leaves follow the pattern; sections
      // named after a topic (面試衝刺 2.1 滑動視窗, 1700→2100 1.1 二分搜尋) win.
      // Prose-only sub-pages (「子集枚舉與 SOS DP」 under 位元進階) always
      // follow their parent so a pattern's prose stays together.
      const proseOnly = ids.length === 0 && inherited !== null;
      const topic =
        overrides[section.title] ??
        (proseOnly ? inherited : null) ??
        keywordTopic(stripNumericPrefix(section.title)) ??
        inherited ??
        (ids.length > 0 ? voteTopic(ids, placements) : null);
      out.push({ source: source.key, section, path: fullPath, topic });
      for (const child of section.children ?? []) walk(child, fullPath, topic);
    };
    for (const top of source.root.children) walk(top, [], null);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Problem placement
// ---------------------------------------------------------------------------

interface RouteProblem {
  id: string;
  item: StudyPlanData.Item;
  labels: string[];
  sourceTopics: TopicKey[];
}

function sourceLabel(source: AdventureSourceKey, path: string[]): string {
  const base = SOURCE_LABELS[source] ?? source;
  const leaf = path[path.length - 1] ?? "";
  if (source === "q3_handbook" || source === "q4_handbook") {
    const tier = leaf.match(/[：:](必修|進階|挑戰)$/)?.[1];
    return tier ? `${base} ${tier}` : base;
  }
  if (source === "rating_2100") {
    const phase = path[0]?.match(/Phase\s*(\d)/)?.[1];
    return phase ? `${base} 階段${phase}` : base;
  }
  return base;
}

function collectRouteProblems(sections: SourceSection[]): RouteProblem[] {
  const byId = new Map<string, RouteProblem>();
  for (const { source, section, path, topic } of sections) {
    for (const item of section.problems ?? []) {
      const id = item.id?.toString();
      if (!id) continue;
      const label = sourceLabel(source, path);
      const existing = byId.get(id);
      if (existing) {
        if (!existing.labels.includes(label)) existing.labels.push(label);
        if (topic && !existing.sourceTopics.includes(topic)) {
          existing.sourceTopics.push(topic);
        }
        continue;
      }
      byId.set(id, {
        id,
        item,
        labels: [label],
        sourceTopics: topic ? [topic] : [],
      });
    }
  }
  return [...byId.values()];
}

interface Home {
  leaf: Leaf | null;
  topic: TopicKey;
}

function manualHome(id: string, leavesByTop: Map<string, Leaf[]>): Home | null {
  const entry = PROBLEM_HOMES[id];
  if (!entry) return null;
  const [topic, prefix] = entry;
  const top = Number(prefix.split(".")[0]);
  const leaf = (leavesByTop.get(`${topic}:${top}`) ?? []).find(
    (l) =>
      l.section.title.startsWith(`${prefix} `) ||
      l.section.title.startsWith(`${prefix}. `),
  );
  if (!leaf)
    throw new Error(`PROBLEM_HOMES[${id}] → ${topic} ${prefix} not found`);
  return { leaf, topic };
}

/**
 * Where a problem lives on the route: the topic its old plan filed it under
 * when 0x3F agrees, otherwise its earliest 0x3F topic; within the topic, the
 * first non-misc section that lists it.
 */
function chooseHome(
  problem: RouteProblem,
  placements: Placement[],
  leavesByTop: Map<string, Leaf[]>,
  report: AdventureReport,
): Home {
  const manual = manualHome(problem.id, leavesByTop);
  if (placements.length === 0) {
    if (manual) return manual;
    const topic = problem.sourceTopics[0] ?? "greedy";
    report.notIn0x3F.push({ id: problem.id, title: problem.item.title, topic });
    return { leaf: null, topic };
  }

  const byOrder = [...placements].sort(
    (a, b) =>
      TOPIC_ORDER.get(a.leaf.topic)! - TOPIC_ORDER.get(b.leaf.topic)! ||
      a.order - b.order,
  );
  const topic =
    problem.sourceTopics.find((t) => byOrder.some((p) => p.leaf.topic === t)) ??
    byOrder[0]!.leaf.topic;

  const inTopic = byOrder.filter((p) => p.leaf.topic === topic);
  const specific =
    inTopic.find((p) => !p.leaf.misc) ?? byOrder.find((p) => !p.leaf.misc);
  if (specific) return { leaf: specific.leaf, topic: specific.leaf.topic };

  if (manual) return manual;

  report.miscUnresolved.push({
    id: problem.id,
    title: problem.item.title,
    topic,
  });
  return { leaf: inTopic[0]!.leaf, topic };
}

// ---------------------------------------------------------------------------
// Tree assembly
// ---------------------------------------------------------------------------

function ratingOf(problem: RouteProblem, ratings: AdventureInput["ratings"]) {
  const own = problem.item.score;
  if (typeof own === "number" && own > 0) return own;
  const library = ratings[problem.id];
  return typeof library === "number" && library > 0 ? library : null;
}

function toItem(
  problem: RouteProblem,
  ratings: AdventureInput["ratings"],
): StudyPlanData.Item {
  return {
    ...problem.item,
    score: ratingOf(problem, ratings),
    // Shown as chips under the title; ProblemList splits on "/" and "·".
    subsection: problem.labels.join(" / "),
  };
}

const TIER_NAMES = ["基礎", "進階", "挑戰"];

/** Split a big stage into rating-ordered pieces of about SPLIT_TARGET. */
function splitByRating(
  title: string,
  items: StudyPlanData.Item[],
): { title: string; items: StudyPlanData.Item[] }[] {
  if (items.length <= SPLIT_THRESHOLD) return [{ title, items }];
  const parts = Math.ceil(items.length / SPLIT_TARGET);
  const size = Math.ceil(items.length / parts);
  const chunks: { title: string; items: StudyPlanData.Item[] }[] = [];
  for (let i = 0; i < parts; i++) {
    const chunk = items.slice(i * size, (i + 1) * size);
    if (chunk.length === 0) continue;
    const name = parts <= 3 ? TIER_NAMES[i]! : `第 ${i + 1} 部分`;
    const rated = chunk
      .map((item) => item.score)
      .filter((s): s is number => typeof s === "number");
    const range =
      rated.length > 0
        ? `・${Math.round(Math.min(...rated))}–${Math.round(Math.max(...rated))}`
        : "";
    chunks.push({ title: `${title}（${name}${range}）`, items: chunk });
  }
  return chunks;
}

function byRating(a: StudyPlanData.Item, b: StudyPlanData.Item) {
  return (
    (a.score ?? 0) - (b.score ?? 0) ||
    String(a.id).localeCompare(String(b.id), undefined, { numeric: true })
  );
}

interface Draft {
  title: string;
  summary?: string;
  problems?: StudyPlanData.Item[];
  children?: Draft[];
}

/**
 * Number titles and assign ids: topic × 1e6 + chapter × 1e4 + stage × 100,
 * then a running counter inside each stage. Ids only depend on position, so
 * regenerating with the same structure keeps 破關模式 stage keys stable.
 */
function finalize(
  drafts: Draft[],
  prefix: string,
  idBase: number,
  depth: number,
  counter: { next: number } = { next: 1 },
): StudyPlanData.Section[] {
  const stride = [1_000_000, 10_000, 100][depth];
  return drafts.map((draft, i): StudyPlanData.Section => {
    const number = prefix ? `${prefix}.${i + 1}` : `${i + 1}`;
    const ownCounter = depth === 2 ? { next: 1 } : counter;
    const id =
      stride !== undefined
        ? idBase + (i + 1) * stride
        : idBase + counter.next++;
    if (counter.next >= 100) {
      throw new Error(`too many sections under ${prefix} for the id scheme`);
    }
    const children = draft.children
      ? finalize(
          draft.children,
          number,
          stride !== undefined ? id : idBase,
          depth + 1,
          ownCounter,
        )
      : undefined;
    return {
      id,
      title: prefix ? `${number} ${draft.title}` : `${number}. ${draft.title}`,
      ...(draft.summary ? { summary: draft.summary } : {}),
      ...(draft.problems ? { problems: draft.problems } : {}),
      ...(children && children.length > 0 ? { children } : {}),
    };
  });
}

/** Copy a source prose subtree without its problems (they live elsewhere now). */
function proseDraft(
  section: StudyPlanData.Section,
  title: string,
): Draft | null {
  const children = (section.children ?? [])
    .map((child) => proseDraft(child, stripNumericPrefix(child.title)))
    .filter((d): d is Draft => d !== null);
  const summary = section.summary?.trim();
  if (!summary && children.length === 0) return null;
  return {
    title,
    ...(summary ? { summary } : {}),
    ...(children.length > 0 ? { children } : {}),
  };
}

/** Pick the source sections whose prose moves into each topic. */
function collectProse(sections: SourceSection[]) {
  const topicOf = new Map(sections.map((s) => [s.section, s.topic]));
  const pathOf = new Map(sections.map((s) => [s.section, s.path]));
  const sourceOf = new Map(sections.map((s) => [s.section, s.source]));
  const byTopic = new Map<TopicKey | null, Draft[]>();
  const push = (topic: TopicKey | null, draft: Draft | null) => {
    if (!draft) return;
    byTopic.set(topic, [...(byTopic.get(topic) ?? []), draft]);
  };

  // A subtree moves as one piece (a Q3 pattern with its 模式總覽 and
  // sub-pages) when every section in it is about the same topic.
  const uniform = (
    section: StudyPlanData.Section,
    topic: TopicKey | null,
  ): boolean =>
    topicOf.get(section) === topic &&
    (section.children ?? []).every((child) => uniform(child, topic));

  const nameOf = (section: StudyPlanData.Section) => {
    const source = sourceOf.get(section)!;
    const path = pathOf.get(section)!;
    const phase =
      source === "rating_2100"
        ? path[0]?.match(/Phase\s*(\d)/)?.[1]
        : undefined;
    const label = SOURCE_LABELS[source] ?? source;
    const title = stripNumericPrefix(section.title).replace(
      /（\d+\s*題）$/,
      "",
    );
    return `${label}${phase ? ` 階段${phase}` : ""}・${title}`;
  };

  const visit = (section: StudyPlanData.Section) => {
    const topic = topicOf.get(section) ?? null;
    if (uniform(section, topic)) {
      push(topic, proseDraft(section, nameOf(section)));
      return;
    }
    // Mixed container (面試衝刺「高優題單」, a 1700→2100 phase): keep its own
    // intro in the appendix and hand each child to its topic.
    const summary = section.summary?.trim();
    if (summary) push(null, { title: nameOf(section), summary });
    for (const child of section.children ?? []) visit(child);
  };

  for (const entry of sections) {
    if (entry.path.length === 1) visit(entry.section);
  }
  return byTopic;
}

interface Piece {
  title: string;
  items: StudyPlanData.Item[];
  /** 0x3F section names this piece covers. */
  names: string[];
  /** Part of a rating split; never merged with neighbours. */
  splitPart: boolean;
}

function packedTitle(names: string[], chapterTitle: string, whole: boolean) {
  if (names.length === 1) return names[0]!;
  if (whole) return chapterTitle;
  if (names.length === 2) return `${names[0]}、${names[1]}`;
  return `${names[0]}、${names[1]} 等 ${names.length} 節`;
}

/**
 * Pack neighbouring small sections of a chapter into stages of at least
 * MIN_STAGE_SIZE problems, without growing past SPLIT_THRESHOLD. Problems in
 * a packed stage get their 0x3F section name as a chip.
 */
function packSmallStages(pieces: Piece[], chapterTitle: string): Draft[] {
  const buckets: Piece[][] = [];
  let current: Piece[] = [];
  const size = (bucket: Piece[]) =>
    bucket.reduce((acc, p) => acc + p.items.length, 0);
  const close = () => {
    if (current.length > 0) buckets.push(current);
    current = [];
  };
  for (const piece of pieces) {
    if (piece.splitPart) {
      close();
      buckets.push([piece]);
      continue;
    }
    if (
      current.length > 0 &&
      size(current) + piece.items.length > SPLIT_THRESHOLD
    ) {
      close();
    }
    current.push(piece);
    if (size(current) >= MIN_STAGE_SIZE) close();
  }
  if (current.length > 0) {
    // A small tail joins the previous bucket when that stays within bounds.
    const last = buckets[buckets.length - 1];
    if (
      last &&
      !last[0]!.splitPart &&
      size(last) + size(current) <= SPLIT_THRESHOLD
    ) {
      last.push(...current);
    } else {
      buckets.push(current);
    }
  }

  return buckets.map((bucket) => {
    if (bucket.length === 1) {
      const piece = bucket[0]!;
      // A chapter that is one stage is named after the chapter, not 「基礎」.
      const whole = buckets.length === 1 && !piece.splitPart;
      return {
        title: whole ? chapterTitle : piece.title,
        problems: piece.items,
      };
    }
    const names = bucket.flatMap((p) => p.names);
    const problems = bucket
      .flatMap((p) =>
        p.items.map((item) => ({
          ...item,
          subsection: [p.names[0], item.subsection].filter(Boolean).join(" / "),
        })),
      )
      .sort(byRating);
    return {
      title: packedTitle(names, chapterTitle, bucket.length === pieces.length),
      problems,
    };
  });
}

function buildTopic(
  config: TopicConfig,
  homes: Map<Leaf, StudyPlanData.Item[]>,
  extras: StudyPlanData.Item[],
  leavesByTop: Map<string, Leaf[]>,
  prose: Draft[],
): Draft | null {
  const chapters: Draft[] = [];
  for (const chapter of config.chapters) {
    const groups =
      chapter.stages ??
      chapter.sections.flatMap((top) =>
        (leavesByTop.get(`${config.key}:${top}`) ?? []).map((leaf) => ({
          title: leaf.name,
          leaves: [leaf],
        })),
      );
    const pieces: Piece[] = [];
    for (const group of groups) {
      const leaves =
        "leaves" in group
          ? group.leaves
          : group.sections.flatMap(
              (top) => leavesByTop.get(`${config.key}:${top}`) ?? [],
            );
      const items = leaves
        .flatMap((leaf) => homes.get(leaf) ?? [])
        .sort(byRating);
      if (items.length === 0) continue;
      const split = splitByRating(group.title, items);
      for (const piece of split) {
        pieces.push({
          ...piece,
          names: [group.title],
          splitPart: split.length > 1,
        });
      }
    }
    const stages = packSmallStages(pieces, chapter.title);
    if (stages.length > 0)
      chapters.push({ title: chapter.title, children: stages });
  }
  if (extras.length > 0) {
    chapters.push({
      title: "本路線補充題",
      summary: "這些題目不在靈茶題單內，來自原本的自建題單。",
      children: splitByRating("補充題", [...extras].sort(byRating)).map(
        (piece) => ({ title: piece.title, problems: piece.items }),
      ),
    });
  }
  if (chapters.length === 0 && prose.length === 0) return null;

  const intro: Draft[] =
    prose.length > 0
      ? [
          {
            title: "導讀：原題單的講解",
            summary: "以下收錄原本自建題單中與本主題相關的講解，可先讀再刷題。",
            children: prose,
          },
        ]
      : [];
  return {
    title: config.title,
    summary: `本主題依靈茶山艾府「${config.title}」題單的分類排列，完整觀念與模板請見同名講義。`,
    children: [...intro, ...chapters],
  };
}

export function buildAdventurePlan(input: AdventureInput): {
  root: StudyPlanData.Root;
  report: AdventureReport;
} {
  const report: AdventureReport = {
    sourceTopics: [],
    miscUnresolved: [],
    notIn0x3F: [],
    problemCount: 0,
  };
  const { placements, leavesByTop } = indexTopics(input.topics);
  const sections = resolveSourceTopics(input.sources, placements);
  report.sourceTopics = sections
    .filter((s) => (s.section.problems?.length ?? 0) > 0 || s.path.length === 1)
    .map((s) => ({
      source: s.source,
      section: s.path.join(" > "),
      topic: s.topic,
    }));

  const homes = new Map<Leaf, StudyPlanData.Item[]>();
  const extras = new Map<TopicKey, StudyPlanData.Item[]>();
  for (const problem of collectRouteProblems(sections)) {
    const home = chooseHome(
      problem,
      placements.get(problem.id) ?? [],
      leavesByTop,
      report,
    );
    const item = toItem(problem, input.ratings);
    if (home.leaf) {
      homes.set(home.leaf, [...(homes.get(home.leaf) ?? []), item]);
    } else {
      extras.set(home.topic, [...(extras.get(home.topic) ?? []), item]);
    }
    report.problemCount += 1;
  }

  const prose = collectProse(sections);
  const topics = ADVENTURE_TOPICS.map((config) =>
    buildTopic(
      config,
      homes,
      extras.get(config.key) ?? [],
      leavesByTop,
      prose.get(config.key) ?? [],
    ),
  ).filter((d): d is Draft => d !== null);

  const appendix: Draft[] = [
    ...(prose.get(null) ?? []),
    ...input.sources
      .filter((s) => s.summary?.trim())
      .map((s) => ({
        title: `${SOURCE_LABELS[s.key] ?? s.key}・原題單說明`,
        summary: s.summary!.trim(),
      })),
  ];
  if (appendix.length > 0) {
    topics.push({
      title: "附錄：面試題型與原題單說明",
      summary: "不屬於單一主題的講解。",
      children: appendix,
    });
  }

  return {
    root: {
      id: 0,
      title: ADVENTURE_TITLE,
      src: null,
      last_update: null,
      summary: ADVENTURE_SUMMARY,
      children: finalize(topics, "", 0, 0),
    },
    report,
  };
}

/** Strip prose so the route can be bundled for stats, sidebar and quests. */
export function stripProse(root: StudyPlanData.Root): StudyPlanData.Root {
  const strip = (
    section: StudyPlanData.Section,
  ): StudyPlanData.Section | null => {
    const children = (section.children ?? [])
      .map(strip)
      .filter((c): c is StudyPlanData.Section => c !== null);
    if ((section.problems?.length ?? 0) === 0 && children.length === 0) {
      return null;
    }
    return {
      id: section.id,
      title: section.title,
      ...(section.problems ? { problems: section.problems } : {}),
      ...(children.length > 0 ? { children } : {}),
    };
  };
  return {
    ...root,
    summary: undefined,
    children: root.children
      .map(strip)
      .filter((c): c is StudyPlanData.Section => c !== null),
  };
}
