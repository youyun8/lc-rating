import { STUDYPLANS } from "@/config/constants";
import type { StudyPlanData } from "@/types";

import rating2100Data from "@/public/studyplan/rating_2100.json";
import rating2400Data from "@/public/studyplan/rating_2400.json";
import binarySearchData from "@/public/studyplan/binary_search.json";
import bitwiseOpsData from "@/public/studyplan/bitwise_operations.json";
import dataStructureData from "@/public/studyplan/data_structure.json";
import dpData from "@/public/studyplan/dynamic_programming.json";
import graphData from "@/public/studyplan/graph.json";
import greedyData from "@/public/studyplan/greedy.json";
import gridData from "@/public/studyplan/grid.json";
import mathData from "@/public/studyplan/math.json";
import monotonicStackData from "@/public/studyplan/monotonic_stack.json";
import slidingWindowData from "@/public/studyplan/sliding_window.json";
import stringData from "@/public/studyplan/string.json";
import treesData from "@/public/studyplan/trees.json";

export const studyPlanDataMap: Record<string, StudyPlanData.Root> = {
  rating_2100: rating2100Data as StudyPlanData.Root,
  rating_2400: rating2400Data as StudyPlanData.Root,
  binary_search: binarySearchData as StudyPlanData.Root,
  bitwise_operations: bitwiseOpsData as StudyPlanData.Root,
  data_structure: dataStructureData as StudyPlanData.Root,
  dynamic_programming: dpData as StudyPlanData.Root,
  graph: graphData as StudyPlanData.Root,
  greedy: greedyData as StudyPlanData.Root,
  grid: gridData as StudyPlanData.Root,
  math: mathData as StudyPlanData.Root,
  monotonic_stack: monotonicStackData as StudyPlanData.Root,
  sliding_window: slidingWindowData as StudyPlanData.Root,
  string: stringData as StudyPlanData.Root,
  trees: treesData as StudyPlanData.Root,
};

export interface StudyPlanProblemPlan {
  planKey: string;
  planTitle: string;
}

export interface StudyPlanProblemInfo {
  title?: string;
  plans: StudyPlanProblemPlan[];
}

function buildStudyPlanProblemIndex() {
  const index: Record<string, StudyPlanProblemInfo> = {};

  const addProblem = (
    problem: StudyPlanData.Item,
    planKey: string,
    planTitle: string
  ) => {
    const problemId = problem.id?.toString();
    if (!problemId) return;
    const existing = index[problemId];
    const plans = existing?.plans ?? [];
    if (!plans.some((plan) => plan.planKey === planKey)) {
      plans.push({ planKey, planTitle });
    }
    index[problemId] = {
      title: existing?.title ?? problem.title,
      plans,
    };
  };

  const walkSection = (
    section: StudyPlanData.Section,
    planKey: string,
    planTitle: string
  ) => {
    if (section.problems) {
      section.problems.forEach((problem) =>
        addProblem(problem, planKey, planTitle)
      );
    }
    if (section.children) {
      section.children.forEach((child) =>
        walkSection(child, planKey, planTitle)
      );
    }
  };

  Object.entries(studyPlanDataMap).forEach(([planKey, plan]) => {
    const planTitle =
      STUDYPLANS[planKey as keyof typeof STUDYPLANS] ?? plan.title ?? planKey;
    plan.children?.forEach((section) =>
      walkSection(section, planKey, planTitle)
    );
  });

  return index;
}

const studyPlanProblemIndex = buildStudyPlanProblemIndex();

export function getStudyPlanProblemInfo(problemId: string) {
  return studyPlanProblemIndex[problemId];
}
