import type { Metadata } from "next";
import { lazy } from "react";

export const metadata: Metadata = {
  title: "題庫",
  description:
    "LeetCode 題庫檢索，可依題號、難度評分、演算法標籤與做題進度篩選。",
};

const ProblemSet = lazy(() => import("@/features/problemset"));

export default function Page() {
  return <ProblemSet />;
}
