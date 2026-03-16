import { lazy } from "react";

const StudyPlanOverview = lazy(() => import("@/components/StudyPlan/Overview"));

export default function Page() {
  return <StudyPlanOverview />;
}
