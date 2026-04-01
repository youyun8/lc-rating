import { lazy } from "react";

const Troubleshoot = lazy(() => import("@/components/Troubleshoot"));

export default function Page() {
  return <Troubleshoot />;
}
