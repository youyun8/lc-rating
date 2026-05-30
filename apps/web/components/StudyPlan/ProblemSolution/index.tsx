import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ProblemSolution as ProblemSolutionType,
  useProblemSolutionsStore,
} from "@/hooks/useProblemSolutions";
import hljs from "highlight.js";
import { Check, Code2, Copy, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

interface SolutionEditorProps {
  index: number;
  solution: ProblemSolutionType;
  canDelete: boolean;
  onChange: (next: ProblemSolutionType) => void;
  onDelete: () => void;
}

function SolutionEditor({
  index,
  solution,
  canDelete,
  onChange,
  onDelete,
}: SolutionEditorProps) {
  const [copied, setCopied] = useState(false);
  const highlighted = useMemo(
    () => highlightCode(solution.code, solution.language),
    [solution.code, solution.language],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(solution.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-emerald-100 px-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
          題解 {index + 1}
        </span>
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

      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="edit" className="text-xs">
            編輯
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-xs">
            預覽
          </TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="mt-2">
          <Textarea
            value={solution.code}
            onChange={(event) =>
              onChange({ ...solution, code: event.target.value })
            }
            placeholder="在此貼上你的程式碼解法..."
            className="min-h-[16rem] resize-y font-mono text-sm leading-6"
            spellCheck={false}
          />
        </TabsContent>
        <TabsContent value="preview" className="mt-2">
          {solution.code.trim().length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-border/60">
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-3 py-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  {languageLabel(solution.language)}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "已複製" : "複製"}
                </button>
              </div>
              <pre className="max-h-[24rem] overflow-auto text-sm leading-6">
                <code
                  className={`hljs language-${solution.language}`}
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                />
              </pre>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
              尚未輸入程式碼。
            </div>
          )}
        </TabsContent>
      </Tabs>
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
  const [drafts, setDrafts] = useState<ProblemSolutionType[]>([]);

  const savedCount = solutions?.length ?? 0;

  useEffect(() => {
    if (open) {
      setDrafts(
        solutions && solutions.length > 0
          ? solutions.map((solution) => ({ ...solution }))
          : [createEmptySolution()],
      );
    }
  }, [open, solutions]);

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
    setOpen(false);
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
      <DialogContent className="max-h-[90vh] gap-4 overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="pr-7 text-base leading-snug">
            {problemId}. {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {drafts.map((draft, index) => (
            <SolutionEditor
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

        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            取消
          </Button>
          <Button type="button" onClick={handleSave}>
            儲存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
