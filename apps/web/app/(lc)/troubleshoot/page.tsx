import type { Metadata } from "next";
import { lazy } from "react";

export const metadata: Metadata = {
  title: "故障排除",
  description: "檢查並修復雲端同步的常見問題，例如登入狀態與資料同步。",
};

const Troubleshoot = lazy(() => import("@/components/Troubleshoot"));

export default function Page() {
  return <Troubleshoot />;
}
