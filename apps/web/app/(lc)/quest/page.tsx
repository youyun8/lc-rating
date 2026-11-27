import type { Metadata } from "next";
import { lazy } from "react";

export const metadata: Metadata = {
  title: "破關模式",
  description:
    "把題單變成關卡地圖：AC 題目收集星星、擊敗各區魔王、升級稱號，一路把題單消完。",
};

const QuestHub = lazy(() => import("@/features/quest/Hub"));

export default function Page() {
  return <QuestHub />;
}
