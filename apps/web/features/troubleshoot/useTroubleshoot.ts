"use client";

import {
  API_BASE,
  LC_RATING_AUTH_TOKEN_KEY,
  LC_RATING_LAST_SYNC_AT_KEY,
  LC_RATING_PROBLEM_SOLUTIONS_KEY,
  LC_RATING_PROGRESS_KEY,
} from "@/config/constants";
import { useSiteStorage } from "@/hooks/useSiteStorage";
import {
  clearAuthToken,
  decodeAuthToken,
  decodeAuthTokenUnchecked,
  getErrorMessage,
} from "@/utils/auth";
import { checkBackendHealth } from "@/utils/cloudSync";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DiagnosticCheck, formatTime } from "./diagnostics";

export function useTroubleshoot() {
  const { siteStorage } = useSiteStorage();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [checks, setChecks] = useState<DiagnosticCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [syncErrors, setSyncErrors] = useState<string[]>([]);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);

  useEffect(() => {
    setAuthToken(localStorage.getItem(LC_RATING_AUTH_TOKEN_KEY));

    const handleAuthUpdate = () => {
      setAuthToken(localStorage.getItem(LC_RATING_AUTH_TOKEN_KEY));
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LC_RATING_AUTH_TOKEN_KEY) setAuthToken(e.newValue);
    };

    window.addEventListener("lc-rating-auth-update", handleAuthUpdate);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("lc-rating-auth-update", handleAuthUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Capture console.error for sync errors
  useEffect(() => {
    const origError = console.error;
    const captured: string[] = [];
    console.error = (...args: unknown[]) => {
      const msg = args
        .map((a) => (typeof a === "string" ? a : String(a)))
        .join(" ");
      if (
        msg.includes("sync") ||
        msg.includes("Sync") ||
        msg.includes("cloud") ||
        msg.includes("Upload") ||
        msg.includes("token")
      ) {
        captured.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
        setSyncErrors((prev) => [...prev, ...captured.splice(0)]);
      }
      origError.apply(console, args);
    };
    return () => {
      console.error = origError;
    };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(LC_RATING_LAST_SYNC_AT_KEY);
    setLastSyncAt(stored ? Number(stored) : null);
  }, []);

  const decodedToken = useMemo(
    () => decodeAuthTokenUnchecked(authToken),
    [authToken],
  );
  const isTokenExpired = useMemo(() => {
    if (!decodedToken) return false;
    return decodedToken.exp < Date.now();
  }, [decodedToken]);
  const validPayload = useMemo(() => decodeAuthToken(authToken), [authToken]);

  const progressCount = Object.keys(siteStorage.progress ?? {}).length;
  const solutionCount = Object.values(
    siteStorage.problemSolutions ?? {},
  ).reduce((count, solutions) => count + solutions.length, 0);

  const tokenStatus: DiagnosticCheck = useMemo(() => {
    if (!authToken) {
      return {
        name: "驗證 Token",
        status: "warning",
        detail: "尚未登入，無 Token",
      };
    }
    if (!decodedToken) {
      return {
        name: "驗證 Token",
        status: "fail",
        detail: "Token 格式無法解析",
      };
    }
    if (isTokenExpired) {
      return {
        name: "驗證 Token",
        status: "fail",
        detail: `Token 已過期 (${formatTime(decodedToken.exp)})`,
      };
    }
    return {
      name: "驗證 Token",
      status: "pass",
      detail: `有效至 ${formatTime(decodedToken.exp)}，使用者：${decodedToken.username}`,
    };
  }, [authToken, decodedToken, isTokenExpired]);

  const runDiagnostics = useCallback(async () => {
    setIsRunning(true);
    const results: DiagnosticCheck[] = [tokenStatus];

    // Backend reachability
    try {
      const health = await checkBackendHealth();
      const supportsSolutions =
        health.capabilities?.includes("problemSolutions") === true;
      results.push({
        name: "後端連線",
        status: health.ok && supportsSolutions ? "pass" : "fail",
        detail: health.ok
          ? supportsSolutions
            ? `${health.message}，支援題解同步`
            : `${health.message}，但目前部署版本尚未宣告支援題解同步`
          : health.message,
      });
    } catch (error) {
      results.push({
        name: "後端連線",
        status: "fail",
        detail: getErrorMessage(error),
      });
    }

    // localStorage
    try {
      const testKey = "__troubleshoot_test__";
      localStorage.setItem(testKey, "1");
      localStorage.removeItem(testKey);
      results.push({
        name: "本機儲存",
        status: "pass",
        detail: "localStorage 可正常讀寫",
      });
    } catch {
      results.push({
        name: "本機儲存",
        status: "fail",
        detail: "localStorage 無法存取（可能已滿或被封鎖）",
      });
    }

    // Progress data
    try {
      const raw = localStorage.getItem(LC_RATING_PROGRESS_KEY);
      if (!raw) {
        results.push({
          name: "進度資料",
          status: "warning",
          detail: "尚無本機進度資料",
        });
      } else {
        const parsed = JSON.parse(raw);
        const count = Object.keys(parsed?.state?.progress ?? {}).length;
        results.push({
          name: "進度資料",
          status: "pass",
          detail: `${count} 筆進度，資料大小 ${(raw.length / 1024).toFixed(1)} KB`,
        });
      }
    } catch {
      results.push({
        name: "進度資料",
        status: "fail",
        detail: "進度資料格式異常",
      });
    }

    // Solution data
    try {
      const raw = localStorage.getItem(LC_RATING_PROBLEM_SOLUTIONS_KEY);
      if (!raw) {
        results.push({
          name: "題解資料",
          status: "warning",
          detail: "尚無本機題解資料",
        });
      } else {
        const parsed = JSON.parse(raw);
        const count = Object.values(
          parsed?.state?.problemSolutions ?? {},
        ).reduce(
          (sum: number, solutions) =>
            sum + (Array.isArray(solutions) ? solutions.length : 0),
          0,
        );
        results.push({
          name: "題解資料",
          status: "pass",
          detail: `${count} 份題解，資料大小 ${(raw.length / 1024).toFixed(1)} KB`,
        });
      }
    } catch {
      results.push({
        name: "題解資料",
        status: "fail",
        detail: "題解資料格式異常",
      });
    }

    // Last sync
    results.push({
      name: "上次同步",
      status: lastSyncAt ? "pass" : "warning",
      detail: lastSyncAt ? formatTime(lastSyncAt) : "尚未同步過",
    });

    setChecks(results);
    setIsRunning(false);
  }, [tokenStatus, lastSyncAt]);

  const handleReAuthenticate = useCallback(() => {
    if (!API_BASE) {
      toast("未設定後端，無法登入");
      return;
    }
    clearAuthToken();
    window.location.href = `${API_BASE}/api/login/github`;
  }, []);

  const handleClearCache = useCallback(() => {
    if (
      !window.confirm(
        "確定要清除快取嗎？這會清除 Token 和上次同步記錄（進度資料不受影響）。",
      )
    ) {
      return;
    }
    clearAuthToken();
    localStorage.removeItem(LC_RATING_LAST_SYNC_AT_KEY);
    setAuthToken(null);
    setChecks([]);
    toast("已清除快取");
  }, []);

  return {
    authToken,
    decodedToken,
    validPayload,
    lastSyncAt,
    progressCount,
    solutionCount,
    checks,
    isRunning,
    syncErrors,
    clearSyncErrors: () => setSyncErrors([]),
    runDiagnostics,
    handleReAuthenticate,
    handleClearCache,
  };
}
