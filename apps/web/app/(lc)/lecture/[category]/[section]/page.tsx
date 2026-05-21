import { GoogleSectionPage } from "@/components/Tutorial/GoogleSectionPage";
import {
  getGoogleInterviewSectionTutorial,
  googleInterviewSectionTutorials,
} from "@/data/googleInterviewSectionTutorials";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return googleInterviewSectionTutorials.map((section) => ({
    category: "google_interview",
    section: section.slug,
  }));
}

interface PageProps {
  params: Promise<{ category: string; section: string }>;
}

export default async function Page({ params }: PageProps) {
  const { category, section } = await params;

  if (
    category !== "google_interview" ||
    !getGoogleInterviewSectionTutorial(section)
  ) {
    notFound();
  }

  return <GoogleSectionPage sectionSlug={section} />;
}
