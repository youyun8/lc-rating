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
import type { InterviewFrequency } from "@/features/handbook/model";

export const metadata: Metadata = {
  title: "Chapters by Interview Frequency — LeetCode Pattern Handbook",
  description:
    "Handbook chapters ranked by how frequently the pattern appears in real software-engineering interviews, combining LeetCode company-frequency tags, contest appearance rate, and study-guide prominence.",
};

/** Tiers, rendered top to bottom. */
const TIER_ORDER: InterviewFrequency[] = ["High", "Medium", "Low"];

/** Per-tier copy shared by the summary table and the section headers. */
const TIER_META: Record<InterviewFrequency, { ranks: string; blurb: string }> =
  {
    High: {
      ranks: "Ranks 1–5",
      blurb: "Asked in almost every screen — master these first.",
    },
    Medium: {
      ranks: "Ranks 6–15",
      blurb: "Frequently asked; the backbone of most study lists.",
    },
    Low: {
      ranks: "Ranks 16+",
      blurb: "Situational, advanced, or competitive-leaning patterns.",
    },
  };

/** The three weighted inputs to the composite score. */
const SCORING = [
  {
    weight: "40%",
    label: "Company-frequency tags",
    desc: "How often the chapter’s problems are tagged as asked by top companies (FAANG, Microsoft, …).",
  },
  {
    weight: "30%",
    label: "Contest appearance",
    desc: "Share of the chapter’s problems rated in the 1700–2000 contest band.",
  },
  {
    weight: "30%",
    label: "Study-guide prominence",
    desc: "Coverage across the NeetCode roadmap, Grind 75/150, Blind 75, and Sean Prashad’s list.",
  },
];

export default function Page() {
  const ranking = [...INTERVIEW_FREQUENCY_RANKING].sort(
    (a, b) => a.rank - b.rank,
  );
  const byTier = (tier: InterviewFrequency) =>
    ranking.filter((e) => e.frequency === tier);

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
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Every handbook chapter ranked by how often its pattern shows up in
            real software-engineering interviews, scored from three weighted
            sources.
          </p>
        </header>

        {/* How the score is built */}
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            How the score is built
          </h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {SCORING.map((s) => (
              <li
                key={s.label}
                className="flex flex-col gap-1.5 rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
              >
                <span className="inline-flex w-fit items-center rounded-lg bg-primary/10 px-2 py-0.5 text-sm font-bold tabular-nums text-primary">
                  {s.weight}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {s.label}
                </span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {s.desc}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Tiers at a glance */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Tiers at a glance
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Tier</TableHead>
                  <TableHead className="w-28">Ranks</TableHead>
                  <TableHead className="w-20 text-right">Chapters</TableHead>
                  <TableHead>What it means</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TIER_ORDER.map((tier) => (
                  <TableRow key={tier}>
                    <TableCell>
                      <InterviewFrequencyBadge frequency={tier} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {TIER_META[tier].ranks}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums text-foreground">
                      {byTier(tier).length}
                    </TableCell>
                    <TableCell className="whitespace-normal text-sm leading-relaxed text-muted-foreground">
                      {TIER_META[tier].blurb}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Ranked chapters, grouped by tier */}
        <div className="space-y-8">
          {TIER_ORDER.map((tier) => {
            const entries = byTier(tier);
            if (entries.length === 0) return null;
            return (
              <section key={tier}>
                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <InterviewFrequencyBadge frequency={tier} />
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    {tier} frequency
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {TIER_META[tier].ranks} · {entries.length} chapters
                  </span>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {entries.map((entry) => {
                    const topic = getHandbookTopic(entry.slug);
                    return (
                      <li key={entry.slug}>
                        <Link
                          href={`/handbook/${entry.slug}`}
                          className="group flex h-full flex-col gap-2 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
                              {entry.rank}
                            </span>
                            <h3 className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                              {topic?.title ?? entry.slug}
                            </h3>
                          </div>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {entry.rationale}
                          </p>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
