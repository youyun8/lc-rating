import { useGlobalSettingsStore } from "@/hooks/useGlobalSettings";
import { cn } from "@/lib/utils";
import React from "react";

interface I18NLinkProps {
  link: {
    en: string;
    zh: string;
  };
  title: string;
  className?: string;
  style?: React.CSSProperties;
}

const I18NLink = React.memo(
  ({ link, title, className, style }: I18NLinkProps) => {
    const linkLanguage = useGlobalSettingsStore((s) => s.linkLanguage);
    const linkLocal = linkLanguage === "zh" ? link.zh : link.en;

    return (
      <a
        href={linkLocal}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("text-left hover:underline", className)}
        style={style}
      >
        {title}
      </a>
    );
  }
);

I18NLink.displayName = "I18NLink";

export { I18NLink };
