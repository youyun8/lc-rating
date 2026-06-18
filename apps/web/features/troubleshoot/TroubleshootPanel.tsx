"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn, RefreshCw, Trash2 } from "lucide-react";
import { StatusIcon, formatTime } from "./diagnostics";
import { useTroubleshoot } from "./useTroubleshoot";

export default function TroubleshootPanel() {
  const {
    authToken,
    decodedToken,
    validPayload,
    lastSyncAt,
    progressCount,
    solutionCount,
    checks,
    isRunning,
    syncErrors,
    clearSyncErrors,
    runDiagnostics,
    handleReAuthenticate,
    handleClearCache,
  } = useTroubleshoot();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        檢查同步狀態、Token 有效性和後端連線，協助排除同步問題。
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
            onClick={clearSyncErrors}
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
