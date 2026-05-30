"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  API_BASE,
  LC_RATING_AUTH_TOKEN_KEY,
  LC_RATING_LAST_SYNC_AT_KEY,
} from "@/config/constants";
import { useSiteStorage } from "@/hooks/useSiteStorage";
import { decodeAuthToken } from "@/utils/auth";
import { Cloud, LogIn, X } from "lucide-react";
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

function countProblemSolutions(
  problemSolutions: Record<string, unknown> | undefined,
) {
  if (!problemSolutions) return 0;
  return Object.values(problemSolutions).reduce<number>(
    (count, solutions) =>
      count + (Array.isArray(solutions) ? solutions.length : 0),
    0,
  );
}

const FloatingSyncButton = () => {
  const { siteStorage } = useSiteStorage();
  const [authToken, setAuthToken] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return localStorage.getItem(LC_RATING_AUTH_TOKEN_KEY);
  });
  const [open, setOpen] = useState(false);
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

  const handleLogin = () => {
    if (!API_BASE) {
      toast(BACKEND_SETUP_HINT);
      return;
    }
    window.location.href = `${API_BASE}/api/login/github`;
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

  return (
    <div
      className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[9999] flex flex-col items-end gap-2 pointer-events-auto sm:right-6 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"
      data-floating-sync
    >
      {open ? (
        <div className="w-[min(calc(100vw-2rem),320px)] space-y-3 rounded-2xl border bg-background/95 p-3.5 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/85">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">自動同步</p>
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
            <p className="mt-1">
              本機題解：{countProblemSolutions(siteStorage.problemSolutions)} 份
            </p>
          </div>

          {!API_BASE ? (
            <p className="text-xs text-amber-600 dark:text-amber-300">
              {BACKEND_SETUP_HINT}
            </p>
          ) : isLoggedIn ? (
            <p className="text-xs text-muted-foreground">
              資料變更時會自動同步至雲端。
            </p>
          ) : (
            <Button
              variant="brand"
              className="w-full justify-center"
              onClick={handleLogin}
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
          variant={isLoggedIn ? "success" : "outline"}
          className="h-11 w-11 rounded-full shadow-lg sm:h-12 sm:w-12"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="雲端同步"
          aria-expanded={open}
          type="button"
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : isLoggedIn ? (
            <Cloud className="h-5 w-5" />
          ) : (
            <LogIn className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export { FloatingSyncButton };
