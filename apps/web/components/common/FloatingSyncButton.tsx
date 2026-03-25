"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  API_BASE,
  LC_RATING_AUTH_TOKEN_KEY,
  LC_RATING_LAST_SYNC_AT_KEY,
} from "@/config/constants";
import { useProgressStore } from "@/hooks/useProgress";
import { useSiteStorage } from "@/hooks/useSiteStorage";
import { decodeAuthToken, getErrorMessage } from "@/utils/auth";
import { CloudDownload, CloudUpload, Loader2, LogIn, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const BACKEND_SETUP_HINT = "雲端同步尚未設定，請參考 BACKEND_SETUP.md 進行設定";

function formatTimestamp(timestamp: number | null) {
  if (!timestamp) return "尚無紀錄";

  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

const FloatingSyncButton = () => {
  const { siteStorage } = useSiteStorage();
  const setAllProgress = useProgressStore((state) => state.setAllProgress);
  const [authToken, setAuthToken] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return localStorage.getItem(LC_RATING_AUTH_TOKEN_KEY);
  });
  const [open, setOpen] = useState(false);
  const [isPullingCloud, setIsPullingCloud] = useState(false);
  const [isPushingCloud, setIsPushingCloud] = useState(false);
  const authPayload = useMemo(() => decodeAuthToken(authToken), [authToken]);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    const stored = localStorage.getItem(LC_RATING_LAST_SYNC_AT_KEY);
    return stored ? Number(stored) : null;
  });
  const isLoggedIn = Boolean(authToken);

  useEffect(() => {
    setAuthToken(localStorage.getItem(LC_RATING_AUTH_TOKEN_KEY));
    const stored = localStorage.getItem(LC_RATING_LAST_SYNC_AT_KEY);
    setLastSyncAt(stored ? Number(stored) : null);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LC_RATING_AUTH_TOKEN_KEY) {
        setAuthToken(event.newValue);
      }

      if (event.key === LC_RATING_LAST_SYNC_AT_KEY) {
        setLastSyncAt(event.newValue ? Number(event.newValue) : null);
      }
    };

    const handleAuthUpdate = () => {
      setAuthToken(localStorage.getItem(LC_RATING_AUTH_TOKEN_KEY));
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("lc-rating-auth-update", handleAuthUpdate);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("lc-rating-auth-update", handleAuthUpdate);
    };
  }, []);

  const latestLocalUpdate = useMemo(() => {
    const timestamps = Object.values(siteStorage.progressUpdatedAt ?? {});
    return timestamps.length ? Math.max(...timestamps) : null;
  }, [siteStorage.progressUpdatedAt]);

  const isOutOfSync = Boolean(
    API_BASE &&
      isLoggedIn &&
      latestLocalUpdate &&
      (!lastSyncAt || latestLocalUpdate > lastSyncAt),
  );

  const getToken = () =>
    authToken ?? localStorage.getItem(LC_RATING_AUTH_TOKEN_KEY);

  const handleLogin = () => {
    if (!API_BASE) {
      toast(BACKEND_SETUP_HINT);
      return;
    }
    window.location.href = `${API_BASE}/api/login/github`;
  };

  const handlePullCloud = async () => {
    if (!API_BASE) {
      toast(BACKEND_SETUP_HINT);
      return;
    }
    const token = getToken();
    if (!token) {
      toast("請先登入");
      return;
    }

    setIsPullingCloud(true);
    try {
      const response = await fetch(`${API_BASE}/api/getprogress`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!data?.success) {
        throw new Error(data?.message ?? "拉取失敗");
      }

      const result = data?.result ?? {};
      const progress: Record<string, string> = result.progress ?? {};
      const progressUpdatedAt: Record<string, number> =
        result.progressUpdatedAt ?? {};

      setAllProgress(progress, progressUpdatedAt);
      const now = Date.now();
      localStorage.setItem(LC_RATING_LAST_SYNC_AT_KEY, String(now));
      setLastSyncAt(now);
      toast("雲端同步成功");
      setOpen(false);
    } catch (error) {
      console.error("Error syncing from cloud:", error);
      toast(`雲端同步失敗: ${getErrorMessage(error)}`);
    } finally {
      setIsPullingCloud(false);
    }
  };

  const handlePushCloud = async () => {
    if (!API_BASE) {
      toast(BACKEND_SETUP_HINT);
      return;
    }
    const token = getToken();
    if (!token) {
      toast("請先登入");
      return;
    }

    setIsPushingCloud(true);
    try {
      const response = await fetch(`${API_BASE}/api/uploadprogress`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          progress: siteStorage.progress,
          progressUpdatedAt: siteStorage.progressUpdatedAt ?? {},
        }),
      });
      const data = await response.json();
      if (!data?.success) {
        throw new Error(data?.message ?? "上傳失敗");
      }

      const now = Date.now();
      localStorage.setItem(LC_RATING_LAST_SYNC_AT_KEY, String(now));
      setLastSyncAt(now);
      toast("雲端上傳成功");
      setOpen(false);
    } catch (error) {
      console.error("Error syncing to cloud:", error);
      toast(`雲端上傳失敗: ${getErrorMessage(error)}`);
    } finally {
      setIsPushingCloud(false);
    }
  };

  const cloudState = useMemo(() => {
    if (!API_BASE) {
      return {
        label: "未設定",
        badgeClass:
          "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
      };
    }

    if (isLoggedIn) {
      return {
        label: "已登入",
        badgeClass:
          "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
      };
    }

    return {
      label: "未登入",
      badgeClass:
        "border-muted-foreground/20 bg-muted/70 text-muted-foreground dark:border-muted-foreground/40",
    };
  }, [isLoggedIn]);

  const isSyncing = isPullingCloud || isPushingCloud;

  return (
    <div
      className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[9999] flex flex-col items-end gap-2 pointer-events-auto sm:right-6 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"
      data-floating-sync
    >
      {open ? (
        <div className="w-[min(calc(100vw-2rem),320px)] space-y-3 rounded-2xl border bg-background/95 p-3.5 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/85">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">快速同步</p>
              <p className="text-xs text-muted-foreground">
                {authPayload?.username ?? "尚未登入"}
              </p>
            </div>
            <Badge variant="outline" className={cloudState.badgeClass}>
              {cloudState.label}
            </Badge>
          </div>

          <div className="rounded-md border bg-muted/40 p-2 text-xs text-muted-foreground">
            <p>上次同步：{formatTimestamp(lastSyncAt)}</p>
            <p className="mt-1">
              本機進度：{Object.keys(siteStorage.progress ?? {}).length} 筆
            </p>
          </div>

          {!API_BASE ? (
            <p className="text-xs text-amber-600 dark:text-amber-300">
              {BACKEND_SETUP_HINT}
            </p>
          ) : null}

          {isLoggedIn ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={handlePullCloud}
                disabled={!API_BASE || isSyncing}
                type="button"
              >
                {isPullingCloud ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CloudDownload className="h-4 w-4" />
                )}
                拉取
              </Button>
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={handlePushCloud}
                disabled={!API_BASE || isSyncing}
                type="button"
              >
                {isPushingCloud ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CloudUpload className="h-4 w-4" />
                )}
                上傳
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={handleLogin}
              disabled={!API_BASE}
              type="button"
            >
              <LogIn className="h-4 w-4" />
              登入後同步
            </Button>
          )}
        </div>
      ) : null}

      <div className="relative">
        <Button
          size="icon"
          variant={isLoggedIn ? "default" : "outline"}
          className={`h-11 w-11 rounded-full shadow-lg sm:h-12 sm:w-12 ${
            isLoggedIn ? "bg-emerald-500 text-white hover:bg-emerald-600" : ""
          }`}
          onClick={() => setOpen((prev) => !prev)}
          aria-label="雲端同步"
          aria-expanded={open}
          type="button"
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : isSyncing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isLoggedIn ? (
            <CloudUpload className="h-5 w-5" />
          ) : (
            <LogIn className="h-5 w-5" />
          )}
        </Button>
        {isOutOfSync ? (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-background" />
        ) : null}
      </div>
    </div>
  );
};

export { FloatingSyncButton };
