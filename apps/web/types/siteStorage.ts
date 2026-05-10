import type { Options } from "@/hooks/useOptions";

export type Language = "zh" | "en";
export type ThemePreference = "system" | "light" | "dark";

export interface SiteStorageData {
  theme: ThemePreference;
  tagLanguage: Language;
  linkLanguage: Language;
  premium: boolean;
  options: Options;
  progress: Record<string, string>;
  progressUpdatedAt: Record<string, number>;
  problemNotes: Record<string, string>;
  problemNotesUpdatedAt: Record<string, number>;
}

export type SiteStoragePatch = Partial<SiteStorageData>;

export function isThemePreference(value: string): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}
