"use client";

import {
  LC_RATING_AUTH_TOKEN_KEY,
  LC_RATING_LAST_SYNC_AT_KEY,
} from "@/config/constants";
import { useSiteStorage } from "@/hooks/useSiteStorage";
import { pullCloudSiteStorage } from "@/utils/cloudSync";
import { getErrorMessage } from "@/utils/auth";
import { useEffect } from "react";
import { toast } from "sonner";

const AuthTokenHandler = () => {
  const { setSiteStorage } = useSiteStorage();

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
      pullCloudSiteStorage(token)
        .then((siteStorage) => {
          setSiteStorage(siteStorage);
          const now = Date.now();
          localStorage.setItem(LC_RATING_LAST_SYNC_AT_KEY, String(now));
          toast("雲端同步成功");
        })
        .catch((error) => {
          console.error("Error syncing from cloud:", error);
          toast(`雲端同步失敗: ${getErrorMessage(error)}`);
        });
    };

    toast("已登入，可從雲端拉取站點資料", {
      action: {
        label: "拉取",
        onClick: handleSync,
      },
    });
  }, [setSiteStorage]);

  return null;
};

export { AuthTokenHandler };
