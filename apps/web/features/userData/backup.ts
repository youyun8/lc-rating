"use client";

import { API_BASE } from "@/config/constants";
import { useSiteStorage } from "@/hooks/useSiteStorage";
import type { SiteStorageData } from "@/types/siteStorage";
import { isTokenValid } from "@/utils/auth";
import {
  normalizeCloudSiteStorage,
  pushCloudSiteStorage,
} from "@/utils/cloudSync";
import { useCallback, useState } from "react";
import { markSyncedNow, readToken } from "./sync";

function triggerJsonDownload(filename: string, json: string) {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function backupFileName() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `lc-rating-backup-${stamp}.json`;
}

interface DataBackupActions {
  /** Whether a file import is currently being processed. */
  isBusy: boolean;
  /** Save all of this device's data to a JSON file the user can keep. */
  downloadToDevice: () => void;
  /**
   * Load a previously downloaded JSON file back into this device, then upload
   * it to the cloud when the user is signed in. Rejects on malformed files.
   */
  uploadFromDevice: (file: File) => Promise<void>;
}

/**
 * Local backup escape hatch: lets users move their data on and off this device
 * via plain JSON files, independent of the normal cloud sync flow.
 */
export function useDataBackup(): DataBackupActions {
  const { siteStorage, mergeSiteStorage } = useSiteStorage();
  const [isBusy, setIsBusy] = useState(false);

  const downloadToDevice = useCallback(() => {
    triggerJsonDownload(backupFileName(), JSON.stringify(siteStorage, null, 2));
  }, [siteStorage]);

  const uploadFromDevice = useCallback(
    async (file: File) => {
      setIsBusy(true);
      try {
        const text = await file.text();
        const parsed: unknown = JSON.parse(text);
        const patch = normalizeCloudSiteStorage(parsed);

        if (Object.keys(patch).length === 0) {
          throw new Error("檔案中找不到可匯入的資料");
        }

        // Bring the file's data onto this device.
        mergeSiteStorage(patch);

        // ...and push it up to the cloud when the user is signed in.
        const token = readToken();
        if (API_BASE && token && isTokenValid(token)) {
          const merged: SiteStorageData = { ...siteStorage, ...patch };
          await pushCloudSiteStorage(token, merged);
          markSyncedNow();
        }
      } finally {
        setIsBusy(false);
      }
    },
    [siteStorage, mergeSiteStorage],
  );

  return { isBusy, downloadToDevice, uploadFromDevice };
}
