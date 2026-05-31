import type { Metadata } from "next";
import { lazy } from "react";

export const metadata: Metadata = {
  title: "題單",
  description:
    "由靈茶山艾府（0x3F）整理的演算法主題題單，按知識點分層規劃，並顯示做題進度。",
};

const StudyPlanOverview = lazy(() => import("@/features/studyplan/Overview"));

export default function Page() {
  return <StudyPlanOverview />;
}
