"use client";

import { LC_RATING_AUTH_TOKEN_KEY } from "@/config/constants";
import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Captures the `token` query param returned from the GitHub OAuth redirect,
 * stores it and announces the login. The actual pull-merge-push is handled
 * automatically by `useAutoSync` (mounted via `SyncStatusIndicator`), which
 * reacts to the resulting transition into the signed-in state.
 */
const AuthTokenHandler = () => {
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

    toast("已登入，正在與雲端同步…");
  }, []);

  return null;
};

export { AuthTokenHandler };
