import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE, LC_RATING_AUTH_TOKEN_KEY } from "@/config/constants";
import { useProgressStore } from "@/hooks/useProgress";
import { useSiteStorage } from "@/hooks/useSiteStorage";
import { decodeAuthToken, getErrorMessage } from "@/utils/auth";
import {
  CloudDownload,
  CloudUpload,
  Copy,
  Download,
  HeartCrack,
  Loader2,
  LogIn,
  LogOut,
  ThumbsUp,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const BACKEND_SETUP_HINT = "雲端同步尚未設定，請參考 BACKEND_SETUP.md 進行設定";

function formatTimestamp(timestamp: number | null) {
  if (!timestamp) return "尚無紀錄";

  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export default function SyncStorage() {
  const { siteStorage, setSiteStorage } = useSiteStorage();
  const setAllProgress = useProgressStore((state) => state.setAllProgress);
  const clearAllProgress = useProgressStore((state) => state.clearAllProgress);
  const progressStr = JSON.stringify(siteStorage, null, 2);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPullingCloud, setIsPullingCloud] = useState(false);
  const [isPushingCloud, setIsPushingCloud] = useState(false);

  /** Import JSON in either full site-data format or progress-only format. */
  const importData = (parsedData: Record<string, unknown>) => {
    if (parsedData.progress && typeof parsedData.progress === "object") {
      setSiteStorage(parsedData as Parameters<typeof setSiteStorage>[0]);
    } else {
      throw new Error("無法辨識的 JSON 格式，需包含 progress 欄位");
    }
  };

  useEffect(() => {
    setAuthToken(localStorage.getItem(LC_RATING_AUTH_TOKEN_KEY));

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LC_RATING_AUTH_TOKEN_KEY) {
        setAuthToken(event.newValue);
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

  const form = useForm({
    defaultValues: {
      progressData: "",
    },
  });

  const authPayload = useMemo(() => decodeAuthToken(authToken), [authToken]);

  const cloudStatus = useMemo(() => {
    if (!API_BASE) {
      return {
        label: "未設定後端",
        description: BACKEND_SETUP_HINT,
        className:
          "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
      };
    }

    if (authPayload?.username) {
      return {
        label: "已登入",
        description: `目前帳號：${authPayload.username}`,
        className:
          "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
      };
    }

    if (authToken) {
      return {
        label: "已登入",
        description: "驗證通過，可以進行雲端同步",
        className:
          "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
      };
    }

    return {
      label: "未登入",
      description: "登入 GitHub 後即可拉取或上傳資料",
      className:
        "border-muted-foreground/20 bg-muted/60 text-muted-foreground dark:border-muted-foreground/40",
    };
  }, [authToken, authPayload]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(progressStr);
      toast(<span className="text-green-500">複製成功</span>, {
        icon: <ThumbsUp className="text-green-500 size-full" />,
      });
    } catch (error) {
      const msg = getErrorMessage(error);
      setErrorMessage(`複製失敗: ${msg}`);
      toast(<span className="text-red-500">複製失敗: {msg}</span>, {
        icon: <HeartCrack className="text-red-500 size-full" />,
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([progressStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `site-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast(<span className="text-green-500">下載成功</span>, {
      icon: <ThumbsUp className="text-green-500 size-full" />,
    });
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        importData(parsedData);
        setErrorMessage(null);
        toast(<span className="text-green-500">匯入成功</span>, {
          icon: <ThumbsUp className="text-green-500 size-full" />,
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Error parsing file:", error);
        const msg = getErrorMessage(error);
        setErrorMessage(`檔案格式錯誤: ${msg}`);
        toast(<span className="text-red-500">檔案格式錯誤: {msg}</span>, {
          icon: <HeartCrack className="text-red-500 size-full" />,
        });
      }
    };
    reader.readAsText(file);
  };

  const handleLogin = () => {
    if (!API_BASE) {
      toast(<span className="text-amber-500">{BACKEND_SETUP_HINT}</span>, {
        icon: <HeartCrack className="text-amber-500 size-full" />,
      });
      return;
    }
    window.location.href = `${API_BASE}/api/login/github`;
  };

  const handleLogout = () => {
    localStorage.removeItem(LC_RATING_AUTH_TOKEN_KEY);
    setAuthToken(null);
    toast(<span className="text-green-500">已登出</span>, {
      icon: <ThumbsUp className="text-green-500 size-full" />,
    });
  };

  const handleClearProgress = () => {
    const count = Object.keys(siteStorage.progress ?? {}).length;
    if (count === 0) {
      toast(<span className="text-amber-500">目前沒有進度資料</span>, {
        icon: <HeartCrack className="text-amber-500 size-full" />,
      });
      return;
    }
    if (
      !window.confirm(
        `確定要清除所有進度嗎？共 ${count} 筆資料將被刪除，此操作無法復原。`,
      )
    ) {
      return;
    }
    clearAllProgress();
    toast(<span className="text-green-500">已清除所有進度</span>, {
      icon: <ThumbsUp className="text-green-500 size-full" />,
    });
  };

  const getToken = () =>
    authToken ?? localStorage.getItem(LC_RATING_AUTH_TOKEN_KEY);

  const handlePullCloud = async () => {
    if (!API_BASE) {
      toast(<span className="text-amber-500">{BACKEND_SETUP_HINT}</span>, {
        icon: <HeartCrack className="text-amber-500 size-full" />,
      });
      return;
    }
    const token = getToken();
    if (!token) {
      toast(<span className="text-red-500">請先登入</span>, {
        icon: <HeartCrack className="text-red-500 size-full" />,
      });
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
      setErrorMessage(null);
      toast(<span className="text-green-500">雲端同步成功</span>, {
        icon: <ThumbsUp className="text-green-500 size-full" />,
      });
    } catch (error) {
      console.error("Error syncing from cloud:", error);
      const msg = getErrorMessage(error);
      setErrorMessage(`雲端同步失敗: ${msg}`);
      toast(<span className="text-red-500">雲端同步失敗: {msg}</span>, {
        icon: <HeartCrack className="text-red-500 size-full" />,
      });
    } finally {
      setIsPullingCloud(false);
    }
  };

  const handlePushCloud = async () => {
    if (!API_BASE) {
      toast(<span className="text-amber-500">{BACKEND_SETUP_HINT}</span>, {
        icon: <HeartCrack className="text-amber-500 size-full" />,
      });
      return;
    }
    const token = getToken();
    if (!token) {
      toast(<span className="text-red-500">請先登入</span>, {
        icon: <HeartCrack className="text-red-500 size-full" />,
      });
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

      setErrorMessage(null);
      toast(<span className="text-green-500">雲端上傳成功</span>, {
        icon: <ThumbsUp className="text-green-500 size-full" />,
      });
    } catch (error) {
      console.error("Error syncing to cloud:", error);
      const msg = getErrorMessage(error);
      setErrorMessage(`雲端上傳失敗: ${msg}`);
      toast(<span className="text-red-500">雲端上傳失敗: {msg}</span>, {
        icon: <HeartCrack className="text-red-500 size-full" />,
      });
    } finally {
      setIsPushingCloud(false);
    }
  };

  const onSubmit = (data: { progressData: string }) => {
    try {
      const parsedData = JSON.parse(data.progressData);
      importData(parsedData);
      setErrorMessage(null);
      form.reset({ progressData: "" });
      toast(<span className="text-green-500">匯入成功</span>, {
        icon: <ThumbsUp className="text-green-500 size-full" />,
      });
    } catch (error) {
      console.error("Error setting progress:", error);
      const msg = getErrorMessage(error);
      setErrorMessage(`匯入失敗: ${msg}`);
      toast(<span className="text-red-500">匯入失敗: {msg}</span>, {
        icon: <HeartCrack className="text-red-500 size-full" />,
      });
    }
  };

  const isLoggedIn = Boolean(authToken);
  const progressCount = Object.keys(siteStorage.progress ?? {}).length;
  const timestampCount = Object.keys(
    siteStorage.progressUpdatedAt ?? {},
  ).length;
  const latestLocalUpdate = useMemo(() => {
    const timestamps = Object.values(siteStorage.progressUpdatedAt ?? {});
    return timestamps.length ? Math.max(...timestamps) : null;
  }, [siteStorage.progressUpdatedAt]);

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {errorMessage && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <HeartCrack className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1 break-all">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="shrink-0 rounded p-0.5 hover:bg-red-100 dark:hover:bg-red-900"
            type="button"
            aria-label="關閉錯誤訊息"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">雲端狀態</p>
          <Badge variant="outline" className={`mt-2 ${cloudStatus.className}`}>
            {cloudStatus.label}
          </Badge>
          <p className="mt-2 text-xs text-muted-foreground">
            {cloudStatus.description}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">進度資料</p>
          <p className="mt-2 text-xl font-semibold">{progressCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            含 {timestampCount} 筆時間戳記
          </p>
        </div>

        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">最後本機更新</p>
          <p className="mt-2 text-sm font-medium">
            {formatTimestamp(latestLocalUpdate)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            根據 progressUpdatedAt 計算
          </p>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">雲端同步</h3>
          {isLoggedIn ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              type="button"
            >
              <LogOut className="h-3.5 w-3.5" />
              登出
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogin}
              type="button"
            >
              <LogIn className="h-3.5 w-3.5" />
              GitHub 登入
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          先從雲端拉取可避免覆蓋其他裝置進度，上傳則會以目前資料為主。
        </p>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={handlePullCloud}
            disabled={
              !API_BASE || !isLoggedIn || isPullingCloud || isPushingCloud
            }
            type="button"
          >
            {isPullingCloud ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CloudDownload className="h-4 w-4" />
            )}
            從雲端拉取
          </Button>

          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={handlePushCloud}
            disabled={
              !API_BASE || !isLoggedIn || isPullingCloud || isPushingCloud
            }
            type="button"
          >
            {isPushingCloud ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CloudUpload className="h-4 w-4" />
            )}
            推送至雲端
          </Button>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">本機 JSON 資料</h3>
          <Button variant="ghost" size="sm" onClick={handleCopy} type="button">
            <Copy className="h-3.5 w-3.5" />
            複製
          </Button>
        </div>

        <Textarea
          readOnly
          rows={7}
          value={progressStr}
          className="resize-none field-sizing-fixed bg-muted/40 font-mono text-[11px] leading-relaxed"
        />

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleDownload}
            type="button"
          >
            <Download className="h-4 w-4" />
            匯出 JSON
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleUpload}
            type="button"
          >
            <Upload className="h-4 w-4" />
            匯入 JSON 檔案
          </Button>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold">貼上 JSON 匯入</h3>
        <p className="text-xs text-muted-foreground">
          支援完整站點資料（含 progress）或同步匯出的 JSON。
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="progressData"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                      placeholder='{"progress": {...}, "progressUpdatedAt": {...}}'
                      className="resize-none field-sizing-fixed font-mono text-xs"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" size="sm">
              <Upload className="h-4 w-4" />
              匯入貼上內容
            </Button>
          </form>
        </Form>
      </section>

      <section className="space-y-3 rounded-lg border border-red-200 bg-red-50/60 p-4 dark:border-red-900 dark:bg-red-950/20">
        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
          危險操作
        </h3>
        <p className="text-xs text-red-600/80 dark:text-red-300/80">
          清除後無法復原，建議先匯出 JSON 進行備份。
        </p>
        <Button
          variant="outline"
          size="sm"
          className="border-red-300 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
          onClick={handleClearProgress}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
          清除所有進度 ({progressCount})
        </Button>
      </section>
    </div>
  );
}
