import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ProblemSolution as ProblemSolutionType } from "@/features/userData";
import { cn } from "@/lib/utils";
import { Check, Copy, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { CodeEditor } from "./CodeEditor";
import {
  LANGUAGE_OPTIONS,
  highlightCode,
  languageLabel,
  useCopy,
} from "./solutionUtils";

interface CopyButtonProps {
  code: string;
}

function CopyButton({ code }: CopyButtonProps) {
  const { copied, copy } = useCopy();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => copy(code)}
      className="h-7 gap-1 border-border/60 px-2 text-xs text-muted-foreground hover:text-foreground"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? "已複製" : "複製"}
    </Button>
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
      className={cn(
        "max-h-[26rem] overflow-auto font-mono text-sm leading-6 [font-variant-ligatures:none]",
        className,
      )}
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

export function SolutionViewCard({ index, solution }: SolutionViewCardProps) {
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

export function SolutionEditCard({
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
