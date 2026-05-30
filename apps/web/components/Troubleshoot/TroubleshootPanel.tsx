"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  LogIn,
  RefreshCw,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface DiagnosticCheck {
  name: string;
  status: "pass" | "fail" | "warning";
  detail: string;
}

function StatusIcon({ status }: { status: DiagnosticCheck["status"] }) {
  switch (status) {
    case "pass":
      return <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />;
    case "fail":
      return <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />;
    case "warning":
      return <TriangleAlert className="h-4 w-4 shrink-0 text-amber-600" />;
  }
}

function formatTime(ts: number | null) {
  if (!ts) return "無";
  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(ts));
}

export default function TroubleshootPanel() {
  const { siteStorage } = useSiteStorage();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [checks, setChecks] = useState<DiagnosticCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [syncErrors, setSyncErrors] = useState<string[]>([]);

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

  const decodedToken = useMemo(
    () => decodeAuthTokenUnchecked(authToken),
    [authToken],
  );
  const isTokenExpired = useMemo(() => {
    if (!decodedToken) return false;
    return decodedToken.exp < Date.now();
  }, [decodedToken]);
  const validPayload = useMemo(() => decodeAuthToken(authToken), [authToken]);

  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(LC_RATING_LAST_SYNC_AT_KEY);
    setLastSyncAt(stored ? Number(stored) : null);
  }, []);

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

  const handleReAuthenticate = () => {
    if (!API_BASE) {
      toast("未設定後端，無法登入");
      return;
    }
    clearAuthToken();
    window.location.href = `${API_BASE}/api/login/github`;
  };

  const handleClearCache = () => {
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
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        檢查同步狀態、Token 有效性和後端連線，協助排除雲端同步問題。
      </p>

      {/* Quick status summary */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Token 狀態</p>
          <Badge
            variant="outline"
            className={`mt-2 ${
              !authToken
                ? "border-muted-foreground/20 bg-muted/60 text-muted-foreground"
                : validPayload
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
            }`}
          >
            {!authToken ? "無 Token" : validPayload ? "有效" : "已過期"}
          </Badge>
          {decodedToken && (
            <p className="mt-2 text-xs text-muted-foreground">
              到期：{formatTime(decodedToken.exp)}
            </p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">本機進度</p>
          <p className="mt-2 text-xl font-semibold">{progressCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            上次同步：{formatTime(lastSyncAt)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            本機題解：{solutionCount} 份
          </p>
        </div>
      </section>

      {/* Run diagnostics */}
      <Button
        onClick={runDiagnostics}
        disabled={isRunning}
        className="w-full"
        type="button"
      >
        {isRunning ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        執行診斷
      </Button>

      {/* Results */}
      {checks.length > 0 && (
        <section className="space-y-2 rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold">診斷結果</h3>
          {checks.map((check) => (
            <div
              key={check.name}
              className="flex items-start gap-2 rounded-md border bg-muted/20 p-2.5"
            >
              <StatusIcon status={check.status} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{check.name}</p>
                <p className="text-xs text-muted-foreground break-all">
                  {check.detail}
                </p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Error log */}
      {syncErrors.length > 0 && (
        <section className="space-y-2 rounded-lg border border-red-200 bg-red-50/60 p-4 dark:border-red-900 dark:bg-red-950/20">
          <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
            同步錯誤紀錄
          </h3>
          <div className="max-h-40 overflow-y-auto rounded-md bg-muted/40 p-2">
            {syncErrors.map((msg, i) => (
              <p key={i} className="text-xs font-mono text-muted-foreground">
                {msg}
              </p>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSyncErrors([])}
            type="button"
          >
            清除紀錄
          </Button>
        </section>
      )}

      {/* Actions */}
      <section className="space-y-3 rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold">修復操作</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={handleReAuthenticate}
            type="button"
          >
            <LogIn className="h-4 w-4" />
            重新登入
          </Button>
          <Button
            variant="outline"
            className="w-full justify-center border-red-300 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
            onClick={handleClearCache}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
            清除快取
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          「重新登入」會清除目前 Token 並跳轉至 GitHub 授權頁面。
          「清除快取」只清除 Token 和同步紀錄，不影響進度資料。
        </p>
      </section>
    </div>
  );
}
