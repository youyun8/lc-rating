import { GlobalSettingsStoreState } from "@/hooks/useGlobalSettings";
import { OptionsStoreState } from "@/hooks/useOptions";
import { ProgressStoreState } from "@/hooks/useProgress";

const PROGRESS_KEY_MIGRATION: Record<string, string> = {
  TODO: "PENDING",
  WORKING: "IN_PROGRESS",
  TOO_HARD: "SKIPPED",
  REVIEW_NEEDED: "NEEDS_REVIEW",
  AC: "SOLVED",
};

export const optionToLTS = (
  persistedState: unknown,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _version: number,
): OptionsStoreState => {
  return persistedState as OptionsStoreState;
};

export const progressToLTS = (
  persistedState: unknown,
  version: number,
): ProgressStoreState => {
  const state = persistedState as ProgressStoreState;
  if (version < 1 && state?.progress) {
    const migratedProgress: Record<string, string> = {};
    for (const [id, key] of Object.entries(state.progress)) {
      migratedProgress[id] = PROGRESS_KEY_MIGRATION[key] ?? key;
    }
    return { ...state, progress: migratedProgress };
  }
  return state;
};

export const globalSettingToLTS = (
  persistedState: unknown,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _version: number,
): GlobalSettingsStoreState => {
  return persistedState as GlobalSettingsStoreState;
};
