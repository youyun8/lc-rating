"use client";

import { Button } from "@/components/ui/button";
import {
  signIn,
  signOut,
  useClearProgress,
  useCloudSync,
  useDataBackup,
  useSyncState,
  useTrackedCount,
} from "@/features/userData";
import { getErrorMessage } from "@/utils/auth";
import {
  CheckCircle2,
  CloudOff,
  DatabaseBackup,
  Download,
  HardDriveDownload,
  HardDriveUpload,
  Loader2,
  LogIn,
  LogOut,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import { toast } from "sonner";

function formatLastSynced(timestamp: number | null) {
  if (!timestamp) return "尚未同步";
  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export default function SyncStorage() {
  const { status, account, lastSyncedAt } = useSyncState();
  const { push, pull, isSyncing } = useCloudSync();
  const { isBusy, downloadToDevice, uploadFromDevice } = useDataBackup();
  const trackedCount = useTrackedCount();
  const clearProgress = useClearProgress();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePush = async () => {
    try {
      await push();
      toast("已將本機資料上傳至雲端");
    } catch (error) {
      toast(`上傳失敗：${getErrorMessage(error)}`);
    }
  };

  const handlePull = async () => {
    try {
      await pull();
      toast("已從雲端下載並合併資料");
    } catch (error) {
      toast(`下載失敗：${getErrorMessage(error)}`);
    }
  };

  const handleDownloadToDevice = () => {
    downloadToDevice();
    toast("已下載備份檔到這台裝置");
  };

  const handleFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      await uploadFromDevice(file);
      toast(
        status === "synced"
          ? "已從檔案匯入並上傳到雲端"
          : "已從檔案匯入到這台裝置",
      );
    } catch (error) {
      toast(`匯入失敗：${getErrorMessage(error)}`);
    }
  };

  const handleClearProgress = () => {
    if (trackedCount === 0) {
      toast("目前沒有任何進度可以清除");
      return;
    }
    if (
      !window.confirm(
        `確定要清除所有進度嗎？共 ${trackedCount} 題的紀錄將被刪除，且無法復原。`,
      )
    ) {
      return;
    }
    clearProgress();
    toast("已清除所有進度");
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        登入後，你可以手動將刷題進度、筆記與題解上傳到雲端，或從雲端下載到目前的裝置。
      </p>

      <section className="space-y-3 rounded-lg border bg-card p-4">
        {status === "synced" ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <h3 className="text-sm font-semibold">已登入</h3>
                </div>
                {account && (
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {account}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={signOut} type="button">
                <LogOut className="h-3.5 w-3.5" />
                登出
              </Button>
            </div>
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
                上傳到雲端
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
                從雲端下載
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              上傳會以本機資料覆蓋雲端，下載會將雲端資料合併回本機。
            </p>
          </>
        ) : status === "signed-out" ? (
          <>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 shrink-0 text-muted-foreground" />
              <h3 className="text-sm font-semibold">尚未登入</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              登入 GitHub 後即可在不同裝置間自動同步進度。
            </p>
            <Button variant="brand" size="sm" onClick={signIn} type="button">
              <LogIn className="h-3.5 w-3.5" />
              使用 GitHub 登入
            </Button>
          </>
        ) : (
          <div className="flex items-start gap-2">
            <CloudOff className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-semibold">雲端同步未啟用</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                目前無法使用雲端同步，你的進度仍會安全地保存在這台裝置上。
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold">我的進度</h3>
        <p className="text-xs text-muted-foreground">
          目前已記錄 {trackedCount} 題的刷題進度。
        </p>
        <Button
          variant="outline"
          size="sm"
          className="border-red-300 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
          onClick={handleClearProgress}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
          清除所有進度
        </Button>
      </section>

      <section className="space-y-3 rounded-lg border border-dashed bg-muted/10 p-4">
        <div className="flex items-center gap-2">
          <DatabaseBackup className="h-4 w-4 shrink-0 text-muted-foreground" />
          <h3 className="text-sm font-semibold">進階：本機備份</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          將完整資料下載成檔案保存到這台裝置，或從備份檔還原。還原時若已登入，會一併上傳到雲端。
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadToDevice}
            disabled={isBusy}
            type="button"
          >
            <HardDriveDownload className="h-4 w-4" />
            下載到本機
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            type="button"
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <HardDriveUpload className="h-4 w-4" />
            )}
            從檔案還原
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFileSelected}
          />
        </div>
      </section>
    </div>
  );
}
