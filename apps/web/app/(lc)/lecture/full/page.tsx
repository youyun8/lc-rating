import { lazy } from "react";

const FullLectureLinks = lazy(
  () => import("@/components/Tutorial/FullLectureLinks"),
);

export default function Page() {
  return <FullLectureLinks />;
}
