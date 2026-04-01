import { useCallback, useMemo } from "react";
import { useGlobalSettingsStore } from "./useGlobalSettings";
import { useOptions } from "./useOptions";
import { useProgressStore } from "./useProgress";
import { useTheme } from "next-themes";
import {
  isThemePreference,
  SiteStorageData,
  SiteStoragePatch,
} from "@/types/siteStorage";

/**
 * Per-item merge: for each problem ID keep the entry with the newer timestamp.
 * Items only on one side are always kept.
 */
export function mergeProgress(
  local: SiteStoragePatch,
  cloud: SiteStoragePatch,
): Pick<SiteStoragePatch, "progress" | "progressUpdatedAt"> {
  const localProgress = local.progress ?? {};
  const cloudProgress = cloud.progress ?? {};
  const localTs = local.progressUpdatedAt ?? {};
  const cloudTs = cloud.progressUpdatedAt ?? {};

  const progress: Record<string, string> = {};
  const progressUpdatedAt: Record<string, number> = {};

  const allIds = new Set([
    ...Object.keys(localProgress),
    ...Object.keys(cloudProgress),
  ]);

  for (const id of allIds) {
    const lVal = localProgress[id];
    const cVal = cloudProgress[id];
    const lTime = localTs[id] ?? 0;
    const cTime = cloudTs[id] ?? 0;

    if (lVal !== undefined && cVal !== undefined) {
      if (lTime >= cTime) {
        progress[id] = lVal;
        progressUpdatedAt[id] = lTime || cTime;
      } else {
        progress[id] = cVal;
        progressUpdatedAt[id] = cTime;
      }
    } else if (lVal !== undefined) {
      progress[id] = lVal;
      if (lTime) progressUpdatedAt[id] = lTime;
    } else if (cVal !== undefined) {
      progress[id] = cVal;
      if (cTime) progressUpdatedAt[id] = cTime;
    }
  }

  return { progress, progressUpdatedAt };
}

export function useSiteStorage() {
  const {
    tagLanguage,
    setTagLanguage,
    linkLanguage,
    setLinkLanguage,
    premium,
    setPremium,
  } = useGlobalSettingsStore();
  const { options, setOptions } = useOptions();
  const { theme, setTheme } = useTheme();
  const { progress, progressUpdatedAt, setAllProgress, clearAllProgress } =
    useProgressStore();
  const rawTheme = theme ?? "system";
  const siteTheme: SiteStorageData["theme"] = isThemePreference(rawTheme)
    ? rawTheme
    : "system";

  const siteStorage = useMemo<SiteStorageData>(
    () => ({
      theme: siteTheme,
      tagLanguage,
      linkLanguage,
      premium,
      options,
      progress,
      progressUpdatedAt,
    }),
    [
      siteTheme,
      tagLanguage,
      linkLanguage,
      premium,
      options,
      progress,
      progressUpdatedAt,
    ],
  );

  const setSiteStorage = useCallback(
    (data: SiteStoragePatch) => {
      if (data.theme !== undefined) setTheme(data.theme);
      if (data.tagLanguage !== undefined) setTagLanguage(data.tagLanguage);
      if (data.linkLanguage !== undefined) setLinkLanguage(data.linkLanguage);
      if (data.premium !== undefined) setPremium(data.premium);
      if (data.options !== undefined) setOptions(data.options);
      if (data.progress !== undefined || data.progressUpdatedAt !== undefined) {
        clearAllProgress();
        setAllProgress(data.progress ?? {}, data.progressUpdatedAt ?? {});
      }
    },
    [
      clearAllProgress,
      setAllProgress,
      setLinkLanguage,
      setOptions,
      setPremium,
      setTagLanguage,
      setTheme,
    ],
  );

  /**
   * Merge cloud data with local data per-item using timestamps,
   * then apply non-progress settings from cloud.
   */
  const mergeSiteStorage = useCallback(
    (cloud: SiteStoragePatch) => {
      const merged = mergeProgress(
        { progress, progressUpdatedAt },
        cloud,
      );

      // Apply non-progress cloud settings
      if (cloud.theme !== undefined) setTheme(cloud.theme);
      if (cloud.tagLanguage !== undefined) setTagLanguage(cloud.tagLanguage);
      if (cloud.linkLanguage !== undefined) setLinkLanguage(cloud.linkLanguage);
      if (cloud.premium !== undefined) setPremium(cloud.premium);
      if (cloud.options !== undefined) setOptions(cloud.options);

      clearAllProgress();
      setAllProgress(merged.progress ?? {}, merged.progressUpdatedAt ?? {});
    },
    [
      progress,
      progressUpdatedAt,
      clearAllProgress,
      setAllProgress,
      setLinkLanguage,
      setOptions,
      setPremium,
      setTagLanguage,
      setTheme,
    ],
  );

  return { siteStorage, setSiteStorage, mergeSiteStorage };
}
