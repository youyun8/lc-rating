"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, GraduationCap, Search } from "lucide-react";
import {
  HANDBOOK_GROUP_DESCRIPTIONS,
  HANDBOOK_TOPICS,
  getHandbookTopicsByGroup,
} from "./content";
import { resolveHandbookIcon } from "./icons";
import type { HandbookTopic } from "./model";
import { LeetCodeIdResults } from "@/components/common/LeetCodeIdResults";
import {
  parseLeetCodeId,
  searchHandbookByLeetCodeId,
} from "@/utils/leetcodeContentIndex";

function matchesQuery(topic: HandbookTopic, q: string): boolean {
  if (!q) return true;
  const haystack = (
    topic.title +
    " " +
    topic.tagline +
    " " +
    topic.sections.map((s) => s.title).join(" ")
  ).toLowerCase();
  return haystack.includes(q);
}

function TopicCard({ topic }: { topic: HandbookTopic }) {
  const Icon = resolveHandbookIcon(topic.icon);
  return (
    <Link
      href={`/handbook/${topic.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-500/10 text-lime-600 dark:text-lime-400">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {topic.title}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {topic.tagline}
      </p>
      <div className="mt-auto flex items-center justify-between pt-1">
        <span className="text-xs font-medium text-muted-foreground">
          {topic.sections.length} sections
        </span>
        <span className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Read lecture →
        </span>
      </div>
    </Link>
  );
}

export default function HandbookOverview() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  // A purely-numeric query is treated as a LeetCode id lookup.
  const lcId = useMemo(() => parseLeetCodeId(query), [query]);
  const lcHits = useMemo(
    () => (lcId === null ? [] : searchHandbookByLeetCodeId(lcId)),
    [lcId],
  );

  const groups = useMemo(() => {
    return getHandbookTopicsByGroup()
      .map(({ group, topics }) => ({
        group,
        topics: topics.filter((t) => matchesQuery(t, q)),
      }))
      .filter((entry) => entry.topics.length > 0);
  }, [q]);

  const totalSections = useMemo(
    () => HANDBOOK_TOPICS.reduce((sum, t) => sum + t.sections.length, 0),
    [],
  );

  return (
    <div className="min-h-screen bg-background font-han">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 xl:px-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-background/80 shadow-sm">
          <div className="flex flex-col gap-5 p-5 sm:p-7 xl:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Pattern Handbook
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  LeetCode Pattern Handbook
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  A structured handbook for rating 1700+ pattern recognition:
                  constraints, invariants, proof intuition, C++17 templates, and
                  focused practice problems.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 self-start">
                <div className="rounded-2xl border border-border/60 bg-card px-4 py-3 text-center shadow-sm">
                  <div className="text-2xl font-bold text-foreground">
                    {HANDBOOK_TOPICS.length}
                  </div>
                  <div className="text-xs text-muted-foreground">topics</div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card px-4 py-3 text-center shadow-sm">
                  <div className="text-2xl font-bold text-foreground">
                    {totalSections}
                  </div>
                  <div className="text-xs text-muted-foreground">sections</div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search topics, sections, or a LeetCode ID…"
                className="w-full rounded-xl border border-border/60 bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary/50"
              />
            </div>
          </div>
        </section>

        {/* LeetCode ID lookup results */}
        {lcId !== null && (
          <LeetCodeIdResults id={lcId} hits={lcHits} language="en" />
        )}

        {/* Groups */}
        {lcId === null && (
          <div className="mt-6 space-y-8">
            {groups.map(({ group, topics }) => (
              <section key={group}>
                <div className="mb-3 flex items-start gap-2">
                  <BookOpen className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                      {group}
                    </h2>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                      {HANDBOOK_GROUP_DESCRIPTIONS[group]}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {topics.map((topic) => (
                    <TopicCard key={topic.slug} topic={topic} />
                  ))}
                </div>
              </section>
            ))}

            {groups.length === 0 && (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No topics match{" "}
                <span className="font-medium text-foreground">
                  &ldquo;{query}&rdquo;
                </span>
                .
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
