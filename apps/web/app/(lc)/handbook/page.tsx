import type { Metadata } from "next";
import { lazy } from "react";

export const metadata: Metadata = {
  title: "LeetCode Pattern Handbook",
  description:
    "A structured LeetCode and competitive-programming pattern handbook focused on rating 1700+ recognition, invariants, proof ideas, and C++17 templates.",
};

const HandbookOverview = lazy(
  () => import("@/features/handbook/HandbookOverview"),
);

export default function Page() {
  return <HandbookOverview />;
}
