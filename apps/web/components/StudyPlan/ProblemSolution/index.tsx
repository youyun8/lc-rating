"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ProblemSolution as ProblemSolutionType,
  useProblemSolutionsStore,
} from "@/hooks/useProblemSolutions";
import { cn } from "@/lib/utils";
import hljs from "highlight.js";
import { Check, Code2, Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CodeEditor } from "./CodeEditor";

interface ProblemSolutionProps {
  problemId: string;
  title: string;
}

interface LanguageOption {
  /** Stored value, also used as the highlight.js language id. */
  value: string;
  label: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
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

type DialogMode = "view" | "edit";

function languageLabel(value: string) {
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

function createEmptySolution(): ProblemSolutionType {
  return { id: createId(), title: "", code: "", language: DEFAULT_LANGUAGE };
}

function highlightCode(code: string, language: string) {
  const lang = hljs.getLanguage(language) ? language : "plaintext";
  try {
    return hljs.highlight(code, { language: lang }).value;
  } catch {
    return hljs.highlight(code, { language: "plaintext" }).value;
  }
}

function useCopy() {
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

interface CopyButtonProps {
  code: string;
}

function CopyButton({ code }: CopyButtonProps) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(code)}
      className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? "已複製" : "複製"}
    </button>
  );
}

interface SolutionNumberProps {
  index: number;
}

function SolutionNumber({ index }: SolutionNumberProps) {
  return (
    <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-emerald-100 px-2.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
      題解 {index + 1}
    </span>
  );
}

interface HighlightedCodeProps {
  code: string;
  language: string;
  className?: string;
}

function HighlightedCode({ code, language, className }: HighlightedCodeProps) {
  const highlighted = useMemo(
    () => highlightCode(code, language),
    [code, language],
  );
  return (
    <pre
      className={cn("max-h-[26rem] overflow-auto text-sm leading-6", className)}
    >
      <code
        className={`hljs language-${language}`}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </pre>
  );
}

interface SolutionViewCardProps {
  index: number;
  solution: ProblemSolutionType;
}

function SolutionViewCard({ index, solution }: SolutionViewCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-muted/30 px-3 py-2 sm:px-4">
        <SolutionNumber index={index} />
        {solution.title ? (
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
            {solution.title}
          </span>
        ) : (
          <span className="flex-1" />
        )}
        <Badge variant="outline" className="font-medium">
          {languageLabel(solution.language)}
        </Badge>
        <CopyButton code={solution.code} />
      </div>
      <HighlightedCode code={solution.code} language={solution.language} />
    </div>
  );
}

interface SolutionEditCardProps {
  index: number;
  solution: ProblemSolutionType;
  canDelete: boolean;
  onChange: (next: ProblemSolutionType) => void;
  onDelete: () => void;
}

function SolutionEditCard({
  index,
  solution,
  canDelete,
  onChange,
  onDelete,
}: SolutionEditCardProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 p-3 shadow-sm sm:p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SolutionNumber index={index} />
        <Input
          value={solution.title}
          onChange={(event) =>
            onChange({ ...solution, title: event.target.value })
          }
          placeholder="技巧 / 標題（選填）"
          className="h-8 min-w-[8rem] flex-1 text-sm"
        />
        <Select
          value={solution.language}
          onValueChange={(value) => onChange({ ...solution, language: value })}
        >
          <SelectTrigger className="h-8 w-[8.5rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
          disabled={!canDelete}
          title="刪除此題解"
          aria-label="刪除此題解"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <CodeEditor
        value={solution.code}
        language={solution.language}
        onChange={(code) => onChange({ ...solution, code })}
        placeholder="在此貼上你的程式碼解法..."
      />
    </div>
  );
}

export function ProblemSolution({ problemId, title }: ProblemSolutionProps) {
  const solutions = useProblemSolutionsStore(
    (state) => state.problemSolutions[problemId],
  );
  const setProblemSolutions = useProblemSolutionsStore(
    (state) => state.setProblemSolutions,
  );

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>("view");
  const [drafts, setDrafts] = useState<ProblemSolutionType[]>([]);

  const savedCount = solutions?.length ?? 0;

  useEffect(() => {
    if (!open) {
      return;
    }
    const hasSaved = Boolean(solutions && solutions.length > 0);
    setMode(hasSaved ? "view" : "edit");
    setDrafts(
      hasSaved
        ? solutions!.map((solution) => ({ ...solution }))
        : [createEmptySolution()],
    );
  }, [open, solutions]);

  const startEditing = () => {
    setDrafts(
      solutions && solutions.length > 0
        ? solutions.map((solution) => ({ ...solution }))
        : [createEmptySolution()],
    );
    setMode("edit");
  };

  const updateDraft = (id: string, next: ProblemSolutionType) => {
    setDrafts((prev) => prev.map((draft) => (draft.id === id ? next : draft)));
  };

  const deleteDraft = (id: string) => {
    setDrafts((prev) => prev.filter((draft) => draft.id !== id));
  };

  const addDraft = () => {
    setDrafts((prev) => [...prev, createEmptySolution()]);
  };

  const handleSave = () => {
    setProblemSolutions(problemId, drafts);
    const remaining = drafts.filter(
      (draft) => draft.code.trim().length > 0,
    ).length;
    if (remaining > 0) {
      setMode("view");
    } else {
      setOpen(false);
    }
  };

  const handleCancel = () => {
    if (savedCount > 0) {
      setMode("view");
    } else {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 min-w-9 gap-1.5 border-emerald-200 bg-emerald-50 px-2.5 font-medium text-emerald-700 shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-200"
          title={savedCount > 0 ? `我的題解（${savedCount}）` : "新增我的題解"}
          aria-label={savedCount > 0 ? "編輯我的題解" : "新增我的題解"}
        >
          <Code2 className="h-4 w-4" />
          {savedCount > 0 ? (
            <span className="text-xs font-semibold tabular-nums">
              {savedCount}
            </span>
          ) : null}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border/60 px-5 py-4">
          <DialogTitle className="pr-7 text-base leading-snug">
            {problemId}. {title}
          </DialogTitle>
          <DialogDescription
            className={mode === "view" ? undefined : "sr-only"}
          >
            {mode === "view" ? `已儲存 ${savedCount} 份題解` : "編輯題解"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {mode === "view" ? (
            <div className="flex flex-col gap-3">
              {(solutions ?? []).map((solution, index) => (
                <SolutionViewCard
                  key={solution.id}
                  index={index}
                  solution={solution}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {drafts.map((draft, index) => (
                <SolutionEditCard
                  key={draft.id}
                  index={index}
                  solution={draft}
                  canDelete={drafts.length > 1}
                  onChange={(next) => updateDraft(draft.id, next)}
                  onDelete={() => deleteDraft(draft.id)}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800/60 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                onClick={addDraft}
              >
                <Plus className="h-4 w-4" />
                新增題解
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border/60 px-5 py-4 sm:justify-end">
          {mode === "view" ? (
            <Button type="button" onClick={startEditing}>
              <Pencil className="h-4 w-4" />
              編輯題解
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={handleCancel}>
                取消
              </Button>
              <Button type="button" onClick={handleSave}>
                儲存
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
