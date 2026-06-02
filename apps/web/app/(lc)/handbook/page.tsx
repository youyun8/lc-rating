import type { Metadata } from "next";
import { lazy } from "react";

export const metadata: Metadata = {
  title: "Algorithm Handbook",
  description:
    "Comprehensive competitive-programming lectures with LeetCode techniques and C++ templates, organized by topic.",
};

const HandbookOverview = lazy(
  () => import("@/features/handbook/HandbookOverview"),
);

export default function Page() {
  return <HandbookOverview />;
}
