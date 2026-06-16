import Link from "next/link";
import { ArrowUpRight, FileSearch } from "lucide-react";
import type { LeetCodeHit } from "@/utils/leetcodeContentIndex";

const TEXT = {
  en: {
    heading: (id: number) => `Sections covering LeetCode #${id}`,
    count: (n: number) => `${n} ${n === 1 ? "match" : "matches"}`,
    empty: (id: number) =>
      `No handbook section references LeetCode #${id} yet.`,
  },
  zh: {
    heading: (id: number) => `包含 LeetCode #${id} 的章節`,
    count: (n: number) => `共 ${n} 個結果`,
    empty: (id: number) => `目前沒有講義章節提到 LeetCode #${id}。`,
  },
} as const;

interface LeetCodeIdResultsProps {
  id: number;
  hits: LeetCodeHit[];
  language?: "en" | "zh";
}

/**
 * Renders the results of a "search by LeetCode ID" query: a list of links to
 * the handbook/lecture sections that reference the problem. Shared by both
 * overview pages; `language` only switches the surrounding copy.
 */
export function LeetCodeIdResults({
  id,
  hits,
  language = "en",
}: LeetCodeIdResultsProps) {
  const t = TEXT[language];

  return (
    <section className="mt-6 rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <FileSearch className="h-4 w-4 text-primary" />
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          {t.heading(id)}
        </h2>
        {hits.length > 0 && (
          <span className="ml-auto text-xs font-medium text-muted-foreground">
            {t.count(hits.length)}
          </span>
        )}
      </div>

      {hits.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {t.empty(id)}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {hits.map((hit) => (
            <li key={hit.href}>
              <Link
                href={hit.href}
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-background px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-muted/30"
              >
                <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  #{hit.id}
                </span>
                <span className="min-w-0 flex-1">
                  {hit.problemTitle && (
                    <span className="block truncate text-sm font-normal text-foreground">
                      {hit.problemTitle}
                    </span>
                  )}
                  <span className="block truncate text-xs text-muted-foreground">
                    {hit.groupTitle} · {hit.sectionTitle}
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
