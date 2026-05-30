import { LectureSectionPage } from "@/components/Tutorial/LectureSectionPage";
import {
  getLectureSectionStaticParams,
  getLectureSectionTutorial,
} from "@/data/lectureSectionTutorials";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return getLectureSectionStaticParams();
}

interface PageProps {
  params: Promise<{ category: string; section: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category, section } = await params;
  const lectureSection = getLectureSectionTutorial(category, section);

  if (!lectureSection) {
    return { title: "講義" };
  }

  return {
    title: `${lectureSection.title}（${lectureSection.planTitle}）`,
    description: `${lectureSection.planTitle}・${lectureSection.title} 的講義筆記，含重點整理與相關練習題。`,
  };
}

export default async function Page({ params }: PageProps) {
  const { category, section } = await params;
  const lectureSection = getLectureSectionTutorial(category, section);

  if (!lectureSection) {
    notFound();
  }

  return <LectureSectionPage section={lectureSection} />;
}
