"use client";

import {
  API_BASE,
  LC_RATING_AUTH_TOKEN_KEY,
  LC_RATING_LAST_SYNC_AT_KEY,
} from "@/config/constants";
import { useSiteStorage } from "@/hooks/useSiteStorage";
import { clearAuthToken, decodeAuthToken, isTokenValid } from "@/utils/auth";
import { pullCloudSiteStorage, pushCloudSiteStorage } from "@/utils/cloudSync";
import { useCallback, useEffect, useState } from "react";

export type SyncStatus = "offline" | "signed-out" | "synced";

export interface SyncState {
  /** Whether cloud sync is available at all (backend configured). */
  isConfigured: boolean;
  status: SyncStatus;
  /** Signed-in account name, when available. */
  account: string | null;
  /** Timestamp of the last successful sync, if any. */
  lastSyncedAt: number | null;
}

/** Internal: read the raw auth token. Not part of the public facade surface. */
export function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LC_RATING_AUTH_TOKEN_KEY);
}

function readLastSyncedAt(): number | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(LC_RATING_LAST_SYNC_AT_KEY);
  return stored ? Number(stored) : null;
}

/** Internal: stamp "last synced" and notify same-tab listeners. */
export function markSyncedNow() {
  if (typeof window === "undefined") return;
  const timestamp = String(Date.now());
  localStorage.setItem(LC_RATING_LAST_SYNC_AT_KEY, timestamp);
  // Same-tab listeners (useSyncState) react to this synthetic event.
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: LC_RATING_LAST_SYNC_AT_KEY,
      newValue: timestamp,
    }),
  );
}

/**
 * User-facing sync state. Hides auth tokens, localStorage keys and the
 * cloud transport behind a small, friendly surface.
 */
export function useSyncState(): SyncState {
  const [token, setToken] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  useEffect(() => {
    setToken(readToken());
    setLastSyncedAt(readLastSyncedAt());

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LC_RATING_AUTH_TOKEN_KEY) setToken(event.newValue);
      if (event.key === LC_RATING_LAST_SYNC_AT_KEY) {
        setLastSyncedAt(event.newValue ? Number(event.newValue) : null);
      }
    };
    const handleAuthUpdate = () => setToken(readToken());

    window.addEventListener("storage", handleStorage);
    window.addEventListener("lc-rating-auth-update", handleAuthUpdate);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("lc-rating-auth-update", handleAuthUpdate);
    };
  }, []);

  const isConfigured = Boolean(API_BASE);
  const account = decodeAuthToken(token)?.username ?? null;

  let status: SyncStatus;
  if (!isConfigured) {
    status = "offline";
  } else if (token) {
    status = "synced";
  } else {
    status = "signed-out";
  }

  return { isConfigured, status, account, lastSyncedAt };
}

/** Start the GitHub sign-in flow. No-op when sync is not configured. */
export function signIn() {
  if (!API_BASE || typeof window === "undefined") return;
  window.location.href = `${API_BASE}/api/login/github`;
}

/** Sign out locally. Saved progress is kept on this device. */
export function signOut() {
  clearAuthToken();
}

export interface CloudSyncActions {
  /** Upload this device's data to the cloud, replacing the stored copy. */
  push: () => Promise<void>;
  /** Download the cloud copy and merge it into this device. */
  pull: () => Promise<void>;
  /** Whether a push or pull is currently in flight. */
  isSyncing: boolean;
}

/**
 * Manual cloud sync. Users explicitly push their data to the cloud or pull
 * (and merge) it back — there is no automatic background syncing. Both actions
 * reject if the user isn't signed in or sync isn't configured.
 */
export function useCloudSync(): CloudSyncActions {
  const { siteStorage, mergeSiteStorage } = useSiteStorage();
  const [isSyncing, setIsSyncing] = useState(false);

  const push = useCallback(async () => {
    const token = readToken();
    if (!API_BASE || !token || !isTokenValid(token)) {
      throw new Error("尚未登入，無法同步");
    }
    setIsSyncing(true);
    try {
      await pushCloudSiteStorage(token, siteStorage);
      markSyncedNow();
    } finally {
      setIsSyncing(false);
    }
  }, [siteStorage]);

  const pull = useCallback(async () => {
    const token = readToken();
    if (!API_BASE || !token || !isTokenValid(token)) {
      throw new Error("尚未登入，無法同步");
    }
    setIsSyncing(true);
    try {
      const cloud = await pullCloudSiteStorage(token);
      mergeSiteStorage(cloud);
      markSyncedNow();
    } finally {
      setIsSyncing(false);
    }
  }, [mergeSiteStorage]);

  return { push, pull, isSyncing };
}
