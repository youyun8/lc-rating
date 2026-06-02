"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { HANDBOOK_TOPICS } from "./content";

/**
 * Self-contained promo card linking to the standalone Algorithm Handbook.
 * Rendered on the contest landing (the de-facto home, since `/` redirects
 * to `/contest`). Does not depend on any other feature's components.
 */
export function HandbookEntryCard() {
  return (
    <Link
      href="/handbook"
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-r from-lime-500/10 via-card to-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-lime-500/50 hover:shadow-md sm:p-5"
    >
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-500/15 text-lime-600 dark:text-lime-400">
        <GraduationCap className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
            Algorithm Handbook
          </h3>
          <span className="rounded-full border border-lime-500/40 bg-lime-500/10 px-2 py-0.5 text-[0.65rem] font-medium text-lime-700 dark:text-lime-300">
            New
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
          Comprehensive CP lectures across {HANDBOOK_TOPICS.length} topics —
          techniques &amp; C++ templates.
        </p>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
