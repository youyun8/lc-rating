"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signIn, useCloudSync, useSyncState } from "@/features/userData";
import { getErrorMessage } from "@/utils/auth";
import {
  Cloud,
  Download,
  HeartCrack,
  Loader2,
  LogIn,
  ThumbsUp,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const wrapperClass =
  "fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[9999] flex flex-col items-end gap-2 pointer-events-auto sm:right-6 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]";

function formatLastSynced(timestamp: number | null) {
  if (!timestamp) return "尚未同步";
  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

const FloatingSyncButton = () => {
  const { status, account, lastSyncedAt } = useSyncState();
  const { push, pull, isSyncing } = useCloudSync();
  const [open, setOpen] = useState(false);

  // Cloud sync isn't available here; there's nothing to surface.
  if (status === "offline") {
    return null;
  }

  const isLoggedIn = status === "synced";

  const handlePush = async () => {
    try {
      await push();
      toast(<span className="text-green-500">已上傳至雲端</span>, {
        icon: <ThumbsUp className="text-green-500 size-full" />,
      });
    } catch (error) {
      toast(
        <span className="text-red-500">
          上傳失敗：{getErrorMessage(error)}
        </span>,
        { icon: <HeartCrack className="text-red-500 size-full" /> },
      );
    }
  };

  const handlePull = async () => {
    try {
      await pull();
      toast(<span className="text-green-500">已從雲端下載並合併</span>, {
        icon: <ThumbsUp className="text-green-500 size-full" />,
      });
    } catch (error) {
      toast(
        <span className="text-red-500">
          下載失敗：{getErrorMessage(error)}
        </span>,
        { icon: <HeartCrack className="text-red-500 size-full" /> },
      );
    }
  };

  return (
    <div className={wrapperClass} data-floating-sync>
      {open ? (
        <div className="w-[min(calc(100vw-2rem),320px)] space-y-3 rounded-2xl border bg-background/95 p-3.5 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/85">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold">雲端同步</p>
              <p className="truncate text-xs text-muted-foreground">
                {account ?? "尚未登入"}
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                isLoggedIn
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "border-muted-foreground/20 bg-muted/70 text-muted-foreground dark:border-muted-foreground/40"
              }
            >
              {isLoggedIn ? "已登入" : "未登入"}
            </Badge>
          </div>

          {isLoggedIn ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                上次同步：{formatLastSynced(lastSyncedAt)}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="success"
                  size="sm"
                  className="w-full justify-center"
                  onClick={handlePush}
                  disabled={isSyncing}
                  type="button"
                >
                  {isSyncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  上傳
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                  onClick={handlePull}
                  disabled={isSyncing}
                  type="button"
                >
                  {isSyncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  下載
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                上傳會以本機資料覆蓋雲端，下載會將雲端資料合併回本機。
              </p>
            </div>
          ) : (
            <Button
              variant="brand"
              className="w-full justify-center"
              onClick={signIn}
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
