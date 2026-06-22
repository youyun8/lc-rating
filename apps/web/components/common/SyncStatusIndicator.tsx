"use client";

import {
  useAutoSync,
  useSetSyncStatus,
  useSyncStatus,
} from "@/hooks/useAutoSync";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { useEffect } from "react";

/** How long the success state stays visible before fading back to idle. */
const SUCCESS_VISIBLE_MS = 1500;

/**
 * Small, non-blocking sync status badge pinned to the bottom-left corner.
 * It also mounts the auto-sync orchestrator, so dropping this component into
 * the layout is enough to enable login + on-change cloud syncing.
 *
 * States:
 * - idle:    nothing is rendered.
 * - syncing: spinner + "Syncing...".
 * - success: ✓ + "Synced", then fades to idle after 1.5s.
 * - error:   ⚠ + "Sync failed" (non-blocking).
 */
const SyncStatusIndicator = () => {
  useAutoSync();
  const status = useSyncStatus();
  const setStatus = useSetSyncStatus();

  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(() => setStatus("idle"), SUCCESS_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [status, setStatus]);

  if (status === "idle") return null;

  return (
    <div
      className="pointer-events-none fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 z-[9998] flex items-center gap-1.5 rounded-full border bg-background/95 px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur transition-opacity supports-[backdrop-filter]:bg-background/85 sm:left-6 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"
      role="status"
      aria-live="polite"
    >
      {status === "syncing" && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">同步中…</span>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-emerald-700 dark:text-emerald-300">已同步</span>
        </>
      )}
      {status === "error" && (
        <>
          <TriangleAlert className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-amber-600 dark:text-amber-400">同步失敗</span>
        </>
      )}
    </div>
  );
};

export { SyncStatusIndicator };
