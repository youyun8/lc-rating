import { type ProblemSolution as ProblemSolutionType } from "@/features/userData";
import hljs from "highlight.js";
import { useState } from "react";

export interface LanguageOption {
  /** Stored value, also used as the highlight.js language id. */
  value: string;
  label: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "cpp", label: "C++" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "kotlin", label: "Kotlin" },
  { value: "swift", label: "Swift" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "scala", label: "Scala" },
  { value: "sql", label: "SQL" },
  { value: "plaintext", label: "純文字" },
];

const DEFAULT_LANGUAGE = "cpp";

export type DialogMode = "view" | "edit";

export function languageLabel(value: string) {
  return (
    LANGUAGE_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sol-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptySolution(): ProblemSolutionType {
  return { id: createId(), title: "", code: "", language: DEFAULT_LANGUAGE };
}

export function highlightCode(code: string, language: string) {
  const lang = hljs.getLanguage(language) ? language : "plaintext";
  try {
    return hljs.highlight(code, { language: lang }).value;
  } catch {
    return hljs.highlight(code, { language: "plaintext" }).value;
  }
}

export function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };
  return { copied, copy };
}
