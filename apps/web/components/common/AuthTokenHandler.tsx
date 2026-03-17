"use client";

import {
  API_BASE,
  LC_RATING_AUTH_TOKEN_KEY,
  LC_RATING_LAST_SYNC_AT_KEY,
} from "@/config/constants";
import { useProgressStore } from "@/hooks/useProgress";
import { getErrorMessage } from "@/utils/auth";
import { useEffect } from "react";
import { toast } from "sonner";

const AuthTokenHandler = () => {
  const setAllProgress = useProgressStore((state) => state.setAllProgress);

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const token = currentUrl.searchParams.get("token");

    if (!token) {
      return;
    }

    localStorage.setItem(LC_RATING_AUTH_TOKEN_KEY, token);
    window.dispatchEvent(new Event("lc-rating-auth-update"));
    currentUrl.searchParams.delete("token");
    window.history.replaceState({}, "", currentUrl.toString());

    const handleSync = () => {
      fetch(`${API_BASE}/api/getprogress`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data?.success) {
            throw new Error(data?.message ?? "拉取失敗");
          }

          const result = data?.result ?? {};
          const progress: Record<string, string> = result.progress ?? {};
          const progressUpdatedAt: Record<string, number> = result.progressUpdatedAt ?? {};

          setAllProgress(progress, progressUpdatedAt);
          const now = Date.now();
          localStorage.setItem(LC_RATING_LAST_SYNC_AT_KEY, String(now));
          toast("雲端同步成功");
        })
        .catch((error) => {
          console.error("Error syncing from cloud:", error);
          toast(`雲端同步失敗: ${getErrorMessage(error)}`);
        });
    };

    toast("已登入，可從雲端拉取進度", {
      action: {
        label: "拉取",
        onClick: handleSync,
      },
    });
  }, [setAllProgress]);

  return null;
};

export { AuthTokenHandler };
