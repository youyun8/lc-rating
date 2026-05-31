import { STUDYPLANS } from "@/config/constants";
import type { Metadata } from "next";
import { lazy } from "react";

const Tutorial = lazy(() => import("@/features/tutorial"));

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
    return { title: "講義" };
  }

  return {
    title: `${title}講義`,
    description: `${title}主題講義與筆記，依章節順序整理。`,
  };
}

export default async function Page({ params }: PageProps) {
  const { category } = await params;
  return <Tutorial plan={category} />;
}
