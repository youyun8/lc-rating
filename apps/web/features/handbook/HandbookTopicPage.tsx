"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, List } from "lucide-react";
import { StudyPlanMarkdownContent } from "@/features/studyplan/MarkdownContent";
import { cn } from "@/lib/utils";
import { resolveHandbookIcon } from "./icons";
import type { HandbookTopic, HandbookTopicRef } from "./model";

interface HandbookTopicPageProps {
  topic: HandbookTopic;
  prev?: HandbookTopicRef;
  next?: HandbookTopicRef;
}

/** Highlights the section currently nearest the top of the viewport. */
function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? "");
  const key = ids.join("|");

  useEffect(() => {
    const sectionIds = key ? key.split("|") : [];
    if (sectionIds.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: 0 },
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [key]);

  return active;
}

export function HandbookTopicPage({
  topic,
  prev,
  next,
}: HandbookTopicPageProps) {
  const Icon = resolveHandbookIcon(topic.icon);
  const ids = topic.sections.map((s) => s.id);
  const active = useActiveSection(ids);

  return (
    <div className="min-h-screen bg-background font-han">
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 xl:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/handbook" className="hover:text-foreground">
            Handbook
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">{topic.title}</span>
        </nav>

        {/* Hero */}
        <header className="mb-6 rounded-3xl border border-border/60 bg-background/80 p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime-500/10 text-lime-600 dark:text-lime-400">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {topic.title}
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {topic.tagline}
              </p>
            </div>
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8">
          {/* Sticky table of contents */}
          <aside className="hidden lg:block">
            <nav className="sticky top-[calc(var(--navbar-height)+1rem)] max-h-[calc(100vh-var(--navbar-height)-2rem)] overflow-y-auto rounded-2xl border border-border/60 bg-card p-3 text-sm shadow-sm">
              <div className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <List className="h-3.5 w-3.5" />
                On this page
              </div>
              <ul className="space-y-0.5">
                {topic.sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={cn(
                        "block rounded-lg px-2 py-1.5 leading-snug transition-colors",
                        active === s.id
                          ? "bg-lime-500/10 font-medium text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Lecture body */}
          <main className="min-w-0">
            {topic.sections.map((s) => (
              <section
                key={s.id}
                id={s.id}
                className="mb-10 scroll-mt-[calc(var(--navbar-height)+1rem)]"
              >
                <h2 className="mb-3 border-b border-border/60 pb-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {s.title}
                </h2>
                <StudyPlanMarkdownContent content={s.body} variant="lecture" />
              </section>
            ))}

            {/* Prev / next */}
            <nav className="mt-8 grid gap-3 border-t border-border/60 pt-6 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={`/handbook/${prev.slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
                  <span className="min-w-0">
                    <span className="block text-xs text-muted-foreground">
                      Previous
                    </span>
                    <span className="block truncate font-medium text-foreground">
                      {prev.title}
                    </span>
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={`/handbook/${next.slug}`}
                  className="group flex items-center justify-end gap-3 rounded-2xl border border-border/60 bg-card p-4 text-right transition-colors hover:border-primary/40 sm:col-start-2"
                >
                  <span className="min-w-0">
                    <span className="block text-xs text-muted-foreground">
                      Next
                    </span>
                    <span className="block truncate font-medium text-foreground">
                      {next.title}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          </main>
        </div>
      </div>
    </div>
  );
}
