import { lazy } from "react";

const TutorialOverview = lazy(() => import("@/components/Tutorial/Overview"));

export default function Page() {
  return <TutorialOverview />;
}
