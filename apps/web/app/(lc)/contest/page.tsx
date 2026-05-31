import type { Metadata } from "next";
import { lazy } from "react";

export const metadata: Metadata = {
  title: "競賽",
  description:
    "歷屆 LeetCode 週賽與雙週賽題目，依 Q1–Q4 顯示每場四題的難度分級。",
};

const Contest = lazy(() => import("@/features/contest"));

export default function Page() {
  return <Contest />;
}
