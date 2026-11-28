/**
 * Generate 冒險路線 from the five self-authored plans and the 0x3F 題單.
 *
 *   npx tsx scripts/buildAdventurePlan.ts            write the files
 *   npx tsx scripts/buildAdventurePlan.ts --check    fail if they're stale
 *   npx tsx scripts/buildAdventurePlan.ts --report   print placement details
 *
 * Writes public/studyplan/adventure.json (with prose, fetched by the 題單 page)
 * and data/adventureTree.json (problems only, bundled for stats and 破關模式).
 * Re-run after syncing upstream or editing a source plan or the taxonomy.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { getMergedStudyPlan } from "@/features/learning/utils/mergeStudyPlanContent";
import type { ProblemMap, StudyPlanData } from "@/types";
import {
  ADVENTURE_SOURCE_KEYS,
  buildAdventurePlan,
  stripProse,
} from "@/utils/adventurePlan";
import { ADVENTURE_TOPICS, type TopicKey } from "@/utils/adventureTaxonomy";

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fullPath = resolve(webRoot, "public/studyplan/adventure.json");
const treePath = resolve(webRoot, "data/adventureTree.json");

const readJson = <T>(path: string): T =>
  JSON.parse(readFileSync(resolve(webRoot, path), "utf8")) as T;

const topics = Object.fromEntries(
  ADVENTURE_TOPICS.map(({ key }) => [
    key,
    readJson<StudyPlanData.Root>(`public/studyplan/${key}.json`),
  ]),
) as Record<TopicKey, StudyPlanData.Root>;

const sources = ADVENTURE_SOURCE_KEYS.map((key) => {
  const merged = getMergedStudyPlan(key);
  if (!merged) throw new Error(`missing source plan ${key}`);
  return { key, root: merged.root, summary: merged.summary };
});

const problems = readJson<ProblemMap>("public/problemset/problems.json");
const ratings = Object.fromEntries(
  Object.entries(problems).map(([id, p]) => [id, p.rating]),
);

const { root, report } = buildAdventurePlan({ topics, sources, ratings });
const full = JSON.stringify(root);
const tree = `${JSON.stringify(stripProse(root), null, 0)}\n`;

const args = new Set(process.argv.slice(2));

if (args.has("--report")) {
  console.log("Source section → topic");
  for (const row of report.sourceTopics) {
    console.log(`  [${row.topic ?? "附錄"}] ${row.source}: ${row.section}`);
  }
  console.log("\nNot in any 0x3F 題單 (→ 本路線補充題)");
  for (const row of report.notIn0x3F) {
    console.log(`  ${row.id}. ${row.title} → ${row.topic}`);
  }
}

console.log(
  `${report.problemCount} problems, ${report.notIn0x3F.length} outside 0x3F, ` +
    `${report.miscUnresolved.length} misc problems without a specific home`,
);
for (const row of report.miscUnresolved) {
  console.log(`  unresolved misc: ${row.id}. ${row.title} (${row.topic})`);
}

if (args.has("--check")) {
  const stale = [
    [fullPath, `${full}\n`],
    [treePath, tree],
  ].filter(([path, content]) => {
    try {
      return readFileSync(path!, "utf8") !== content;
    } catch {
      return true;
    }
  });
  if (stale.length > 0) {
    console.error(
      `Stale: ${stale.map(([p]) => p).join(", ")}. Run npx tsx scripts/buildAdventurePlan.ts`,
    );
    process.exit(1);
  }
  console.log("adventure plan is up to date");
} else if (!args.has("--report")) {
  writeFileSync(fullPath, `${full}\n`);
  writeFileSync(treePath, tree);
  console.log(`wrote ${fullPath} and ${treePath}`);
}
