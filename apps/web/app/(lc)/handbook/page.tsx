import type { Metadata } from "next";
import { lazy } from "react";

export const metadata: Metadata = {
  title: "LeetCode 模式手冊",
  description:
    "面向 Rating 1700+ 的 LeetCode 與競程模式手冊，聚焦模式辨識、不變式、證明思路與 C++17 模板。",
};

const HandbookOverview = lazy(
  () => import("@/features/handbook/HandbookOverview"),
);

export default function Page() {
  return <HandbookOverview />;
}
