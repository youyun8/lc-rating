import type { Metadata } from "next";
import { lazy } from "react";

export const metadata: Metadata = {
  title: "講義",
  description: "依主題整理的演算法講義與模板筆記，適合學習與複習。",
};

const TutorialOverview = lazy(() => import("@/features/tutorial/Overview"));

export default function Page() {
  return <TutorialOverview />;
}
