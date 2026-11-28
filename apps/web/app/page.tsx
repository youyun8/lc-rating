import type { Metadata } from "next";
import { lazy } from "react";

export const metadata: Metadata = {
  title: "今日",
  description:
    "今日任務、刷題足跡與冒險路線進度：每天從幾題開始，一路把題單消完。",
};

const HomeDashboard = lazy(() => import("@/features/home"));

export default function Home() {
  return <HomeDashboard />;
}
