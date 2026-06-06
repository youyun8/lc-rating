/**
 * Lecture content index. The lecture trees are authored as our own TypeScript
 * modules under `features/lecture/content` (formerly `public/tutorial/*.json`),
 * fully independent of the upstream-cloned studyplan data. This module re-exports
 * the content map under the historical `tutorialDataMap` name so existing
 * consumers keep working.
 */
export { lectureContentMap as tutorialDataMap } from "@/features/lecture/content";
