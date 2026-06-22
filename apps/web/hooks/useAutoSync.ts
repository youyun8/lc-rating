"use client";

import { API_BASE } from "@/config/constants";
import { useSiteStorage } from "@/hooks/useSiteStorage";
import { useProgressStore } from "@/hooks/useProgress";
import {
  markSyncedNow,
  readToken,
  useSyncState,
} from "@/features/userData/sync";
import type { SiteStorageData } from "@/types/siteStorage";
import { isTokenValid } from "@/utils/auth";
import { pullCloudSiteStorage, pushCloudSiteStorage } from "@/utils/cloudSync";
import { useEffect, useRef } from "react";
import { create } from "zustand";

/** How long to wait after the last progress change before pushing. */
const DEBOUNCE_MS = 1500;
/** Exponential backoff (ms) before retry #1 and retry #2 on push failure. */
const RETRY_DELAYS = [1000, 2000];

export type SyncIndicatorStatus = "idle" | "syncing" | "success" | "error";

interface SyncStatusStore {
  status: SyncIndicatorStatus;
  setStatus: (status: SyncIndicatorStatus) => void;
}

/**
 * Tiny shared store for the visual sync status. Kept separate from the
 * persisted progress store so it never touches localStorage.
 */
const useSyncStatusStore = create<SyncStatusStore>((set) => ({
  status: "idle",
  setStatus: (status) => set({ status }),
}));

/** Read the current visual sync status. */
export function useSyncStatus() {
  return useSyncStatusStore((state) => state.status);
}

/** Update the visual sync status (used by the indicator to fade success out). */
export function useSetSyncStatus() {
  return useSyncStatusStore((state) => state.setStatus);
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Push to the cloud, silently retrying with exponential backoff. Throws only
 * after the final attempt fails so callers can decide how to surface it.
 */
async function pushWithRetry(token: string, data: SiteStorageData) {
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      await pushCloudSiteStorage(token, data);
      return;
    } catch (error) {
      const delay = RETRY_DELAYS[attempt];
      if (delay === undefined) throw error;
      await sleep(delay);
    }
  }
}

/**
 * Auto-sync orchestrator. Mount once (e.g. inside the sync status indicator):
 *
 * - On login (transition into the "synced" state): pull remote progress, merge
 *   it with local using last-write-wins by `updatedAt`, write the merged result
 *   back into the store, then push the merged result to the cloud.
 * - On any progress change while logged in: debounce 1500ms, then push.
 *
 * Everything is fire-and-forget; failures only `console.error` and never throw
 * to the UI. When `API_BASE` is empty (sync not configured) the whole hook is a
 * no-op, and guests never trigger any network calls.
 */
export function useAutoSync() {
  const { siteStorage, mergeSiteStorage } = useSiteStorage();
  const { status: syncState } = useSyncState();
  const setStatus = useSetSyncStatus();

  const progress = useProgressStore((state) => state.progress);
  const progressUpdatedAt = useProgressStore(
    (state) => state.progressUpdatedAt,
  );

  // Always-fresh views of the data and merge fn for use inside async callbacks.
  const siteStorageRef = useRef(siteStorage);
  siteStorageRef.current = siteStorage;
  const mergeRef = useRef(mergeSiteStorage);
  mergeRef.current = mergeSiteStorage;

  // Serialized snapshot of the last successfully-pushed payload, to dedupe
  // redundant pushes (e.g. the change effect firing right after a login merge).
  const lastPushedRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevSyncStateRef = useRef<string | null>(null);

  // 1. Login: pull -> merge -> push, immediately and only once per login.
  useEffect(() => {
    const prev = prevSyncStateRef.current;
    prevSyncStateRef.current = syncState;

    if (!API_BASE) return;
    if (syncState !== "synced" || prev === "synced") return;

    const token = readToken();
    if (!token || !isTokenValid(token)) return;

    let cancelled = false;

    (async () => {
      setStatus("syncing");
      try {
        console.log("[auto-sync] login detected — pulling remote progress");
        const remote = await pullCloudSiteStorage(token);
        const merged = mergeRef.current(remote);
        await pushWithRetry(token, merged);
        if (cancelled) return;
        lastPushedRef.current = JSON.stringify(merged);
        markSyncedNow();
        setStatus("success");
        console.log("[auto-sync] login pull-merge-push complete");
      } catch (error) {
        if (cancelled) return;
        console.error("[auto-sync] login sync failed:", error);
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [syncState, setStatus]);

  // 2. Debounced push on any progress change (skip entirely for guests).
  useEffect(() => {
    if (!API_BASE) return;
    const token = readToken();
    if (!token || !isTokenValid(token)) return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      const data = siteStorageRef.current;
      const serialized = JSON.stringify(data);
      if (serialized === lastPushedRef.current) return;

      const freshToken = readToken();
      if (!API_BASE || !freshToken || !isTokenValid(freshToken)) return;

      setStatus("syncing");
      pushWithRetry(freshToken, data)
        .then(() => {
          lastPushedRef.current = serialized;
          markSyncedNow();
          setStatus("success");
          console.log("[auto-sync] debounced push complete");
        })
        .catch((error) => {
          console.error("[auto-sync] push failed:", error);
          setStatus("error");
        });
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [progress, progressUpdatedAt, setStatus]);
}
