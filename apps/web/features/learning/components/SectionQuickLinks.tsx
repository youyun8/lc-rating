import { PanelLeftIcon } from "lucide-react";

import { sectionAnchor } from "@/utils/sectionAnchor";

interface QuickLinkSection {
  id: number;
  title: string;
}

interface SectionQuickLinksProps {
  sections: QuickLinkSection[];
  description: string;
}

export function SectionQuickLinks({
  sections,
  description,
}: SectionQuickLinksProps) {
  return (
    <section className="rounded-2xl border border-border/60 bg-background/90 p-4 shadow-sm xl:hidden sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-border/60 bg-muted/30 p-2 text-muted-foreground">
            <PanelLeftIcon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              快速章節提醒
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${sectionAnchor(section.title)}`}
              className="inline-flex items-center rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {section.title}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
