import { LECTURE_CATEGORIES } from "@/features/lecture/content";
import type { Metadata } from "next";
import { lazy } from "react";

const Tutorial = lazy(() => import("@/features/tutorial"));

export async function generateStaticParams() {
  const categories = Object.keys(LECTURE_CATEGORIES);
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
  const title = LECTURE_CATEGORIES[category];

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
