import { useCallback, useMemo } from "react";
import { useGlobalSettingsStore } from "./useGlobalSettings";
import { Options, useOptions } from "./useOptions";
import { useProgressStore } from "./useProgress";

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
  const { progress, progressUpdatedAt, setAllProgress } = useProgressStore();

  const siteStorage = useMemo(
    () => ({
      tagLanguage,
      linkLanguage,
      premium,
      options,
      progress,
      progressUpdatedAt,
    }),
    [tagLanguage, linkLanguage, premium, options, progress, progressUpdatedAt]
  );

  const setSiteStorage = useCallback(
    (data: {
      tagLanguage?: "zh" | "en";
      linkLanguage?: "zh" | "en";
      premium?: boolean;
      options?: Options;
      progress?: Record<string, string>;
      progressUpdatedAt?: Record<string, number>;
    }) => {
      if (data.tagLanguage !== undefined) setTagLanguage(data.tagLanguage);
      if (data.linkLanguage !== undefined) setLinkLanguage(data.linkLanguage);
      if (data.premium !== undefined) setPremium(data.premium);
      if (data.options !== undefined) setOptions(data.options);
      if (data.progress !== undefined) setAllProgress(data.progress, data.progressUpdatedAt);
    },
    [setTagLanguage, setLinkLanguage, setPremium, setOptions, setAllProgress]
  );

  return { siteStorage, setSiteStorage };
}
