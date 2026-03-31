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

  return { siteStorage, setSiteStorage };
}
