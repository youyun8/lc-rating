import { HandbookTopicPage } from "@/features/handbook/HandbookTopicPage";
import {
  getAdjacentTopics,
  getHandbookTopic,
  getHandbookTopicSlugs,
} from "@/features/handbook/content";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getHandbookTopicSlugs().map((topic) => ({ topic }));
}

interface PageProps {
  params: Promise<{ topic: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { topic } = await params;
  const data = getHandbookTopic(topic);

  if (!data) {
    return { title: "Algorithm Handbook" };
  }

  return {
    title: `${data.title} — Algorithm Handbook`,
    description: data.tagline,
  };
}

export default async function Page({ params }: PageProps) {
  const { topic } = await params;
  const data = getHandbookTopic(topic);

  if (!data) {
    notFound();
  }

  const { prev, next } = getAdjacentTopics(topic);
  return <HandbookTopicPage topic={data} prev={prev} next={next} />;
}
