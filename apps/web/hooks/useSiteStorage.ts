import { useCallback, useMemo } from "react";
import { useGlobalSettingsStore } from "./useGlobalSettings";
import { useOptions } from "./useOptions";
import { useProgressStore } from "./useProgress";
import { useProblemNotesStore } from "./useProblemNotes";
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

export function mergeProblemNotes(
  local: SiteStoragePatch,
  cloud: SiteStoragePatch,
): Pick<SiteStoragePatch, "problemNotes" | "problemNotesUpdatedAt"> {
  const localNotes = local.problemNotes ?? {};
  const cloudNotes = cloud.problemNotes ?? {};
  const localTs = local.problemNotesUpdatedAt ?? {};
  const cloudTs = cloud.problemNotesUpdatedAt ?? {};

  const problemNotes: Record<string, string> = {};
  const problemNotesUpdatedAt: Record<string, number> = {};

  const allIds = new Set([
    ...Object.keys(localNotes),
    ...Object.keys(cloudNotes),
  ]);

  for (const id of allIds) {
    const lVal = localNotes[id];
    const cVal = cloudNotes[id];
    const lTime = localTs[id] ?? 0;
    const cTime = cloudTs[id] ?? 0;

    if (lVal !== undefined && cVal !== undefined) {
      if (lTime >= cTime) {
        problemNotes[id] = lVal;
        problemNotesUpdatedAt[id] = lTime || cTime;
      } else {
        problemNotes[id] = cVal;
        problemNotesUpdatedAt[id] = cTime;
      }
    } else if (lVal !== undefined) {
      problemNotes[id] = lVal;
      if (lTime) problemNotesUpdatedAt[id] = lTime;
    } else if (cVal !== undefined) {
      problemNotes[id] = cVal;
      if (cTime) problemNotesUpdatedAt[id] = cTime;
    }
  }

  return { problemNotes, problemNotesUpdatedAt };
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
  const {
    problemNotes,
    problemNotesUpdatedAt,
    setAllProblemNotes,
    clearAllProblemNotes,
  } = useProblemNotesStore();
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
      problemNotes,
      problemNotesUpdatedAt,
    }),
    [
      siteTheme,
      tagLanguage,
      linkLanguage,
      premium,
      options,
      progress,
      progressUpdatedAt,
      problemNotes,
      problemNotesUpdatedAt,
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
      if (
        data.problemNotes !== undefined ||
        data.problemNotesUpdatedAt !== undefined
      ) {
        clearAllProblemNotes();
        setAllProblemNotes(
          data.problemNotes ?? {},
          data.problemNotesUpdatedAt ?? {},
        );
      }
    },
    [
      clearAllProgress,
      clearAllProblemNotes,
      setAllProgress,
      setAllProblemNotes,
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
      const merged = mergeProgress({ progress, progressUpdatedAt }, cloud);
      const mergedNotes = mergeProblemNotes(
        { problemNotes, problemNotesUpdatedAt },
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
      clearAllProblemNotes();
      setAllProblemNotes(
        mergedNotes.problemNotes ?? {},
        mergedNotes.problemNotesUpdatedAt ?? {},
      );
    },
    [
      progress,
      progressUpdatedAt,
      problemNotes,
      problemNotesUpdatedAt,
      clearAllProgress,
      clearAllProblemNotes,
      setAllProgress,
      setAllProblemNotes,
      setLinkLanguage,
      setOptions,
      setPremium,
      setTagLanguage,
      setTheme,
    ],
  );

  return { siteStorage, setSiteStorage, mergeSiteStorage };
}
