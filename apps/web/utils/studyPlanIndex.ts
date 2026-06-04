import type { StudyPlanData } from "@/types";

import googleInterviewData from "@/public/studyplan/google_interview.json";
import rating2100Data from "@/public/studyplan/rating_2100.json";
import binarySearchData from "@/public/studyplan/binary_search.json";
import sortingData from "@/public/studyplan/sorting.json";
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
  google_interview: googleInterviewData as StudyPlanData.Root,
  rating_2100: rating2100Data as StudyPlanData.Root,
  binary_search: binarySearchData as StudyPlanData.Root,
  sorting: sortingData as StudyPlanData.Root,
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
