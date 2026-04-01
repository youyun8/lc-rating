"use client";

import {
  API_BASE,
  LC_RATING_AUTH_TOKEN_KEY,
  LC_RATING_LAST_SYNC_AT_KEY,
} from "@/config/constants";
import { useSiteStorage } from "@/hooks/useSiteStorage";
import {
  pullCloudSiteStorage,
  pushCloudSiteStorage,
} from "@/utils/cloudSync";
import { AuthExpiredError, isTokenValid } from "@/utils/auth";
import { useEffect, useRef } from "react";

const AUTO_PUSH_DEBOUNCE_MS = 5_000;
const POLL_INTERVAL_MS = 5 * 60 * 1_000; // 5 minutes

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem(LC_RATING_AUTH_TOKEN_KEY)
    : null;
}

function setLastSyncAt(ts: number) {
  localStorage.setItem(LC_RATING_LAST_SYNC_AT_KEY, String(ts));
  // Notify other components (FloatingSyncButton reads this via StorageEvent)
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: LC_RATING_LAST_SYNC_AT_KEY,
      newValue: String(ts),
    }),
  );
}

/**
 * Automatic cloud sync:
 * - Auto-pull on mount (page load)
 * - Debounced auto-push when any site storage changes
 * - Periodic pull every 5 minutes (visibility-gated)
 */
export function useAutoSync() {
  const { siteStorage, mergeSiteStorage } = useSiteStorage();
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncingRef = useRef(false);
  const prevProgressRef = useRef<string>("");

  // --- helpers ---
  const pullAndMerge = async () => {
    const token = getToken();
    if (!token || !isTokenValid(token) || !API_BASE) return;

    try {
      isSyncingRef.current = true;
      const cloud = await pullCloudSiteStorage(token);
      mergeSiteStorage(cloud);
      setLastSyncAt(Date.now());
    } catch (error) {
      if (error instanceof AuthExpiredError) return;
      console.error("Auto-sync pull error:", error);
    } finally {
      isSyncingRef.current = false;
    }
  };

  const pushCurrent = async () => {
    const token = getToken();
    if (!token || !isTokenValid(token) || !API_BASE) return;

    try {
      isSyncingRef.current = true;
      await pushCloudSiteStorage(token, siteStorage);
      setLastSyncAt(Date.now());
    } catch (error) {
      if (error instanceof AuthExpiredError) return;
      console.error("Auto-sync push error:", error);
    } finally {
      isSyncingRef.current = false;
    }
  };

  // --- auto-pull on mount ---
  useEffect(() => {
    pullAndMerge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- debounced auto-push on any site storage change ---
  useEffect(() => {
    const storageSnapshot = JSON.stringify(siteStorage);

    // Skip the initial render and skip if we're mid-sync (i.e., the pull just set data)
    if (
      prevProgressRef.current === "" ||
      isSyncingRef.current ||
      prevProgressRef.current === storageSnapshot
    ) {
      prevProgressRef.current = storageSnapshot;
      return;
    }
    prevProgressRef.current = storageSnapshot;

    // Debounce
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(() => {
      pushCurrent();
    }, AUTO_PUSH_DEBOUNCE_MS);

    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteStorage]);

  // --- periodic poll (visibility-gated) ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (isSyncingRef.current) return;
      pullAndMerge();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
