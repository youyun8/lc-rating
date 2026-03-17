import { GlobalSettingsStoreState } from "@/hooks/useGlobalSettings";
import { OptionsStoreState } from "@/hooks/useOptions";
import { ProgressStoreState } from "@/hooks/useProgress";

export const optionToLTS = (
  persistedState: unknown,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _version: number
): OptionsStoreState => {
  return persistedState as OptionsStoreState;
};

export const progressToLTS = (
  persistedState: unknown,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _version: number
): ProgressStoreState => {
  return persistedState as ProgressStoreState;
};

export const globalSettingToLTS = (
  persistedState: unknown,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _version: number
): GlobalSettingsStoreState => {
  return persistedState as GlobalSettingsStoreState;
};
