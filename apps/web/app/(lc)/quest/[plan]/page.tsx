import { STUDYPLANS } from "@/config/constants";
import type { Metadata } from "next";
import { lazy } from "react";

const StageMap = lazy(() => import("@/features/quest/StageMap"));

export async function generateStaticParams() {
  return Object.keys(STUDYPLANS).map((plan) => ({ plan }));
}

interface PageProps {
  params: Promise<{ plan: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { plan } = await params;
  const title = STUDYPLANS[plan as keyof typeof STUDYPLANS];
  return {
    title: title ? `${title}・破關模式` : "破關模式",
    description: title
      ? `${title}題單的關卡地圖：收集星星、擊敗魔王、一路通關。`
      : "破關模式",
  };
}

export default async function Page({ params }: PageProps) {
  const { plan } = await params;
  return <StageMap plan={plan} />;
}
