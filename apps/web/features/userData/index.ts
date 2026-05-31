// User-data facade: the single entry point UI should use to read and update
// a user's progress, solutions and cloud-sync state. It deliberately hides
// the underlying zustand stores, localStorage keys, auth tokens and cloud
// transport so the UI can speak purely in user terms.

export {
  useSyncState,
  useCloudSync,
  signIn,
  signOut,
  type SyncState,
  type SyncStatus,
  type CloudSyncActions,
} from "./sync";

export {
  useProgressStats,
  useProgressMap,
  useProblemProgress,
  useTrackedCount,
  useClearProgress,
  type ProgressStats,
  type ProgressStatusBreakdown,
} from "./progress";

export { useProblemSolutions, type ProblemSolution } from "./solutions";

export { useDataBackup, type DataBackupActions } from "./backup";
