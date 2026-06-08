import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InterviewFrequencyBadge } from "@/features/handbook/InterviewFrequencyBadge";
import { getHandbookTopic } from "@/features/handbook/content";
import { INTERVIEW_FREQUENCY_RANKING } from "@/features/handbook/content/interview-frequency";

export const metadata: Metadata = {
  title: "Chapters by Interview Frequency — LeetCode Pattern Handbook",
  description:
    "Handbook chapters ranked by how frequently the pattern appears in real software-engineering interviews, combining LeetCode company-frequency tags, contest appearance rate, and study-guide prominence.",
};

export default function Page() {
  const ranking = [...INTERVIEW_FREQUENCY_RANKING].sort(
    (a, b) => a.rank - b.rank,
  );

  return (
    <div className="min-h-screen bg-background font-han">
      <div className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 xl:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/handbook" className="hover:text-foreground">
            Handbook
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">
            Interview Frequency
          </span>
        </nav>

        {/* Hero */}
        <header className="mb-6 rounded-3xl border border-border/60 bg-background/80 p-5 shadow-sm sm:p-7">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Chapters by Interview Frequency
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Every handbook chapter ranked by how often its pattern shows up in
            real software-engineering interviews. The composite score combines
            three weighted sources:{" "}
            <strong className="text-foreground">
              LeetCode company-frequency tags (40%)
            </strong>{" "}
            — how often the chapter&rsquo;s problems are tagged as asked by top
            companies (FAANG, Microsoft, …);{" "}
            <strong className="text-foreground">
              contest appearance rate (30%)
            </strong>{" "}
            — how many of the chapter&rsquo;s problems carry a contest rating in
            the 1700&ndash;2000 band; and{" "}
            <strong className="text-foreground">
              study-guide prominence (30%)
            </strong>{" "}
            — how prominently the pattern features across the NeetCode roadmap,
            Grind 75/150, Blind 75, and Sean Prashad&rsquo;s list. Tiers:{" "}
            <InterviewFrequencyBadge frequency="High" /> ranks 1&ndash;5,{" "}
            <InterviewFrequencyBadge frequency="Medium" /> ranks 6&ndash;15,{" "}
            <InterviewFrequencyBadge frequency="Low" /> ranks 16+.
          </p>
        </header>

        {/* Ranked table */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14 text-right">Rank</TableHead>
                <TableHead>Chapter</TableHead>
                <TableHead className="w-28">Frequency</TableHead>
                <TableHead>Rationale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranking.map((entry) => {
                const topic = getHandbookTopic(entry.slug);
                return (
                  <TableRow key={entry.slug}>
                    <TableCell className="text-right font-medium tabular-nums text-muted-foreground">
                      {entry.rank}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/handbook/${entry.slug}`}
                        className="font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {topic?.title ?? entry.slug}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <InterviewFrequencyBadge frequency={entry.frequency} />
                    </TableCell>
                    <TableCell className="text-sm leading-relaxed text-muted-foreground">
                      {entry.rationale}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
