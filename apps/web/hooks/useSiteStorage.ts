import { useCallback, useMemo } from "react";
import { useGlobalSettingsStore } from "./useGlobalSettings";
import { useOptions } from "./useOptions";
import { useProgressStore } from "./useProgress";
import { useProblemNotesStore } from "./useProblemNotes";
import { useProblemSolutionsStore } from "./useProblemSolutions";
import { useTheme } from "next-themes";
import {
  isThemePreference,
  SiteStorageData,
  SiteStoragePatch,
} from "@/types/siteStorage";

function mergeTimestampedRecords<T>(
  localValues: Record<string, T>,
  cloudValues: Record<string, T>,
  localTimestamps: Record<string, number>,
  cloudTimestamps: Record<string, number>,
) {
  const values: Record<string, T> = {};
  const timestamps: Record<string, number> = {};
  const allIds = new Set([
    ...Object.keys(localValues),
    ...Object.keys(cloudValues),
  ]);

  for (const id of allIds) {
    const localValue = localValues[id];
    const cloudValue = cloudValues[id];
    const localTime = localTimestamps[id] ?? 0;
    const cloudTime = cloudTimestamps[id] ?? 0;

    if (localValue !== undefined && cloudValue !== undefined) {
      if (localTime >= cloudTime) {
        values[id] = localValue;
        timestamps[id] = localTime || cloudTime;
      } else {
        values[id] = cloudValue;
        timestamps[id] = cloudTime;
      }
    } else if (localValue !== undefined) {
      values[id] = localValue;
      if (localTime) timestamps[id] = localTime;
    } else if (cloudValue !== undefined) {
      values[id] = cloudValue;
      if (cloudTime) timestamps[id] = cloudTime;
    }
  }

  return { values, timestamps };
}

export function mergeProgress(
  local: SiteStoragePatch,
  cloud: SiteStoragePatch,
): Pick<SiteStoragePatch, "progress" | "progressUpdatedAt"> {
  const { values, timestamps } = mergeTimestampedRecords(
    local.progress ?? {},
    cloud.progress ?? {},
    local.progressUpdatedAt ?? {},
    cloud.progressUpdatedAt ?? {},
  );

  return { progress: values, progressUpdatedAt: timestamps };
}

export function mergeProblemNotes(
  local: SiteStoragePatch,
  cloud: SiteStoragePatch,
): Pick<SiteStoragePatch, "problemNotes" | "problemNotesUpdatedAt"> {
  const { values, timestamps } = mergeTimestampedRecords(
    local.problemNotes ?? {},
    cloud.problemNotes ?? {},
    local.problemNotesUpdatedAt ?? {},
    cloud.problemNotesUpdatedAt ?? {},
  );

  return { problemNotes: values, problemNotesUpdatedAt: timestamps };
}

export function mergeProblemSolutions(
  local: SiteStoragePatch,
  cloud: SiteStoragePatch,
): Pick<SiteStoragePatch, "problemSolutions" | "problemSolutionsUpdatedAt"> {
  const { values, timestamps } = mergeTimestampedRecords(
    local.problemSolutions ?? {},
    cloud.problemSolutions ?? {},
    local.problemSolutionsUpdatedAt ?? {},
    cloud.problemSolutionsUpdatedAt ?? {},
  );

  return { problemSolutions: values, problemSolutionsUpdatedAt: timestamps };
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
  const {
    problemSolutions,
    problemSolutionsUpdatedAt,
    setAllProblemSolutions,
    clearAllProblemSolutions,
  } = useProblemSolutionsStore();
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
      problemSolutions,
      problemSolutionsUpdatedAt,
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
      problemSolutions,
      problemSolutionsUpdatedAt,
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
      if (
        data.problemSolutions !== undefined ||
        data.problemSolutionsUpdatedAt !== undefined
      ) {
        clearAllProblemSolutions();
        setAllProblemSolutions(
          data.problemSolutions ?? {},
          data.problemSolutionsUpdatedAt ?? {},
        );
      }
    },
    [
      clearAllProgress,
      clearAllProblemNotes,
      clearAllProblemSolutions,
      setAllProgress,
      setAllProblemNotes,
      setAllProblemSolutions,
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
      const mergedSolutions = mergeProblemSolutions(
        { problemSolutions, problemSolutionsUpdatedAt },
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
      clearAllProblemSolutions();
      setAllProblemSolutions(
        mergedSolutions.problemSolutions ?? {},
        mergedSolutions.problemSolutionsUpdatedAt ?? {},
      );
    },
    [
      progress,
      progressUpdatedAt,
      problemNotes,
      problemNotesUpdatedAt,
      problemSolutions,
      problemSolutionsUpdatedAt,
      clearAllProgress,
      clearAllProblemNotes,
      clearAllProblemSolutions,
      setAllProgress,
      setAllProblemNotes,
      setAllProblemSolutions,
      setLinkLanguage,
      setOptions,
      setPremium,
      setTagLanguage,
      setTheme,
    ],
  );

  return { siteStorage, setSiteStorage, mergeSiteStorage };
}
