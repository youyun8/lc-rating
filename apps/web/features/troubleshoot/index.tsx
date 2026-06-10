"use client";

import { useEffect, useState } from "react";
import TroubleshootPanel from "./TroubleshootPanel";

export default function Troubleshoot() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <section className="brand-glow motion-rise relative overflow-hidden rounded-3xl border border-border/60 bg-background/80 p-6 shadow-sm">
          <h1 className="page-title">故障排除</h1>
          <p className="mt-2 text-sm text-muted-foreground">載入中…</p>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-8">
      <section className="brand-glow motion-rise relative overflow-hidden rounded-3xl border border-border/60 bg-background/80 p-6 shadow-sm">
        <h1 className="page-title">故障排除</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          檢查並修復雲端同步的常見問題，例如登入狀態與資料同步。
        </p>
      </section>
      <TroubleshootPanel />
    </div>
  );
}
