import { AlertCircle, CheckCircle, TriangleAlert } from "lucide-react";

export interface DiagnosticCheck {
  name: string;
  status: "pass" | "fail" | "warning";
  detail: string;
}

export function StatusIcon({ status }: { status: DiagnosticCheck["status"] }) {
  switch (status) {
    case "pass":
      return <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />;
    case "fail":
      return <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />;
    case "warning":
      return <TriangleAlert className="h-4 w-4 shrink-0 text-amber-600" />;
  }
}

export function formatTime(ts: number | null) {
  if (!ts) return "無";
  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(ts));
}
