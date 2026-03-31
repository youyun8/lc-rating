import {
  BookOpen,
  Search,
  Cpu,
  Database,
  Layers,
  GitBranch,
  Zap,
  Grid,
  Calculator,
  Maximize,
  Type,
  Trees,
  type LucideIcon,
} from "lucide-react";

export interface StudyPlanTheme {
  gradient: string;
  accent: string;
}

export const studyPlanIcons: Record<string, LucideIcon> = {
  binary_search: Search,
  bitwise_operations: Cpu,
  data_structure: Database,
  dynamic_programming: Layers,
  graph: GitBranch,
  greedy: Zap,
  grid: Grid,
  math: Calculator,
  monotonic_stack: Maximize,
  sliding_window: BookOpen,
  string: Type,
  trees: Trees,
};

export const defaultTheme: StudyPlanTheme = {
  gradient: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
  accent: "#3b82f6",
};

export const studyPlanThemes: Record<string, StudyPlanTheme> = {
  binary_search:       { gradient: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)", accent: "#3b82f6" },
  bitwise_operations:  { gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", accent: "#8b5cf6" },
  data_structure:      { gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)", accent: "#10b981" },
  dynamic_programming: { gradient: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)", accent: "#f97316" },
  graph:               { gradient: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)", accent: "#14b8a6" },
  greedy:              { gradient: "linear-gradient(135deg, #eab308 0%, #a16207 100%)", accent: "#eab308" },
  grid:                { gradient: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)", accent: "#6366f1" },
  math:                { gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)", accent: "#ec4899" },
  monotonic_stack:     { gradient: "linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)", accent: "#06b6d4" },
  sliding_window:      { gradient: "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)", accent: "#a855f7" },
  string:              { gradient: "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)", accent: "#f43f5e" },
  trees:               { gradient: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)", accent: "#22c55e" },
};
