import {
  Binary,
  Boxes,
  Crosshair,
  Gauge,
  Grid3x3,
  Layers,
  Network,
  PanelsTopLeft,
  Share2,
  Sigma,
  Type,
  type LucideIcon,
} from "lucide-react";

/** Resolves the lucide icon referenced by a topic's `icon` field. */
export const HANDBOOK_ICONS: Record<string, LucideIcon> = {
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
};

export function resolveHandbookIcon(name: string): LucideIcon {
  return HANDBOOK_ICONS[name] ?? Boxes;
}
