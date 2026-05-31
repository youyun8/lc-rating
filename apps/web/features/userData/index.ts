// User-data facade: the single entry point UI should use to read and update
// a user's progress, solutions and cloud-sync state. It deliberately hides
// the underlying zustand stores, localStorage keys, auth tokens and cloud
// transport so the UI can speak purely in user terms.

export { useSyncState, useCloudSync, signIn, signOut } from "./sync";

export {
  useProgressStats,
  useRecentProgress,
  useProgressMap,
  useProblemProgress,
  useTrackedCount,
  useClearProgress,
} from "./progress";

export { useProblemSolutions, type ProblemSolution } from "./solutions";

export { useDataBackup } from "./backup";
