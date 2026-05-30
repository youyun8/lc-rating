import type { Metadata } from "next";
import { lazy } from "react";

export const metadata: Metadata = {
  title: "完整講義索引",
  description: "彙整所有章節的完整講義連結，可依主題或章節名稱搜尋。",
};

const FullLectureLinks = lazy(
  () => import("@/components/Tutorial/FullLectureLinks"),
);

export default function Page() {
  return <FullLectureLinks />;
}
