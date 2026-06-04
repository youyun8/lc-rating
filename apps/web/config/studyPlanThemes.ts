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
  Trophy,
  ArrowDownWideNarrow,
  type LucideIcon,
} from "lucide-react";

export interface StudyPlanTheme {
  gradient: string;
  accent: string;
  accentDark: string;
}

export const studyPlanIcons: Record<string, LucideIcon> = {
  google_interview: Search,
  rating_2100: Trophy,
  binary_search: Search,
  sorting: ArrowDownWideNarrow,
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
  accentDark: "#1e40af",
};

export const studyPlanThemes: Record<string, StudyPlanTheme> = {
  google_interview: {
    gradient: "linear-gradient(135deg, #2563eb 0%, #16a34a 100%)",
    accent: "#2563eb",
    accentDark: "#1d4ed8",
  },
  rating_2100: {
    gradient: "linear-gradient(135deg, #0f766e 0%, #115e59 100%)",
    accent: "#0f766e",
    accentDark: "#115e59",
  },
  binary_search: {
    gradient: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
    accent: "#3b82f6",
    accentDark: "#1e40af",
  },
  sorting: {
    gradient: "linear-gradient(135deg, #84cc16 0%, #4d7c0f 100%)",
    accent: "#84cc16",
    accentDark: "#4d7c0f",
  },
  bitwise_operations: {
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    accent: "#8b5cf6",
    accentDark: "#6d28d9",
  },
  data_structure: {
    gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
    accent: "#10b981",
    accentDark: "#047857",
  },
  dynamic_programming: {
    gradient: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
    accent: "#f97316",
    accentDark: "#c2410c",
  },
  graph: {
    gradient: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)",
    accent: "#14b8a6",
    accentDark: "#0f766e",
  },
  greedy: {
    gradient: "linear-gradient(135deg, #eab308 0%, #a16207 100%)",
    accent: "#eab308",
    accentDark: "#a16207",
  },
  grid: {
    gradient: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
    accent: "#6366f1",
    accentDark: "#4338ca",
  },
  math: {
    gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
    accent: "#ec4899",
    accentDark: "#be185d",
  },
  monotonic_stack: {
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)",
    accent: "#06b6d4",
    accentDark: "#0e7490",
  },
  sliding_window: {
    gradient: "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)",
    accent: "#a855f7",
    accentDark: "#7e22ce",
  },
  string: {
    gradient: "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)",
    accent: "#f43f5e",
    accentDark: "#be123c",
  },
  trees: {
    gradient: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
    accent: "#22c55e",
    accentDark: "#15803d",
  },
};
