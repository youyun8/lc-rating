import type { TutorialData } from "@/types";

import rating2100 from "@/public/tutorial/rating_2100.json";
import binarySearch from "@/public/tutorial/binary_search.json";
import bitwiseOps from "@/public/tutorial/bitwise_operations.json";
import dataStructure from "@/public/tutorial/data_structure.json";
import dp from "@/public/tutorial/dynamic_programming.json";
import graph from "@/public/tutorial/graph.json";
import greedy from "@/public/tutorial/greedy.json";
import grid from "@/public/tutorial/grid.json";
import math from "@/public/tutorial/math.json";
import monotonicStack from "@/public/tutorial/monotonic_stack.json";
import slidingWindow from "@/public/tutorial/sliding_window.json";
import stringPlan from "@/public/tutorial/string.json";
import trees from "@/public/tutorial/trees.json";

export const tutorialDataMap: Record<string, TutorialData.Root> = {
  rating_2100: rating2100 as TutorialData.Root,
  binary_search: binarySearch as TutorialData.Root,
  bitwise_operations: bitwiseOps as TutorialData.Root,
  data_structure: dataStructure as TutorialData.Root,
  dynamic_programming: dp as TutorialData.Root,
  graph: graph as TutorialData.Root,
  greedy: greedy as TutorialData.Root,
  grid: grid as TutorialData.Root,
  math: math as TutorialData.Root,
  monotonic_stack: monotonicStack as TutorialData.Root,
  sliding_window: slidingWindow as TutorialData.Root,
  string: stringPlan as TutorialData.Root,
  trees: trees as TutorialData.Root,
};
