"use client";

import { useEffect, useState } from "react";
import TroubleshootPanel from "./TroubleshootPanel";

export default function Troubleshoot() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold">故障排除</h1>
        <p className="mb-6 text-sm text-muted-foreground">載入中…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">故障排除</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        檢查並修復雲端同步相關問題
      </p>
      <TroubleshootPanel />
    </div>
  );
}
