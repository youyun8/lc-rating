import {
  ArrowDownWideNarrow,
  Binary,
  Boxes,
  Crosshair,
  Gauge,
  GitBranch,
  GitCompare,
  Grid3x3,
  Layers,
  Network,
  PanelsTopLeft,
  PencilRuler,
  PieChart,
  Share2,
  Sigma,
  Type,
  type LucideIcon,
} from "lucide-react";

/** Resolves the lucide icon referenced by a topic's `icon` field. */
export const HANDBOOK_ICONS: Record<string, LucideIcon> = {
  ArrowDownWideNarrow,
  Crosshair,
  PanelsTopLeft,
  Layers,
  Gauge,
  Boxes,
  Network,
  Share2,
  Grid3x3,
  Sigma,
  Type,
  Binary,
  GitBranch,
  GitCompare,
  PieChart,
  PencilRuler,
};

export function resolveHandbookIcon(name: string): LucideIcon {
  return HANDBOOK_ICONS[name] ?? Boxes;
}
