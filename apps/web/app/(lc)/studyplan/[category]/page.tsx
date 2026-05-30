import { STUDYPLANS } from "@/config/constants";
import type { Metadata } from "next";
import { lazy } from "react";

const StudyPlan = lazy(() => import("@/components/StudyPlan"));

export async function generateStaticParams() {
  const categories = Object.keys(STUDYPLANS);
  return categories.map((category) => ({
    category,
  }));
}

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;
  const title = STUDYPLANS[category as keyof typeof STUDYPLANS];

  if (!title) {
    return { title: "題單" };
  }

  return {
    title: `${title}題單`,
    description: `${title}主題題單，彙整相關題目與練習順序，並顯示做題進度。`,
  };
}

export default async function Page({ params }: PageProps) {
  const { category } = await params;
  return <StudyPlan plan={category} />;
}
