import { LectureSectionPage } from "@/components/Tutorial/LectureSectionPage";
import {
  getLectureSectionStaticParams,
  getLectureSectionTutorial,
} from "@/data/lectureSectionTutorials";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return getLectureSectionStaticParams();
}

interface PageProps {
  params: Promise<{ category: string; section: string }>;
}

export default async function Page({ params }: PageProps) {
  const { category, section } = await params;
  const lectureSection = getLectureSectionTutorial(category, section);

  if (!lectureSection) {
    notFound();
  }

  return <LectureSectionPage section={lectureSection} />;
}
