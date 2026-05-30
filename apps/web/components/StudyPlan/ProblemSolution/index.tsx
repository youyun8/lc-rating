import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useProblemSolutionsStore } from "@/hooks/useProblemSolutions";
import { cn } from "@/lib/utils";
import hljs from "highlight.js";
import { Check, Code2, Copy, Trash2 } from "lucide-react";
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

function highlightCode(code: string, language: string) {
  const lang = hljs.getLanguage(language) ? language : "plaintext";
  try {
    return hljs.highlight(code, { language: lang }).value;
  } catch {
    return hljs.highlight(code, { language: "plaintext" }).value;
  }
}

export function ProblemSolution({ problemId, title }: ProblemSolutionProps) {
  const solution = useProblemSolutionsStore(
    (state) => state.problemSolutions[problemId],
  );
  const setProblemSolution = useProblemSolutionsStore(
    (state) => state.setProblemSolution,
  );
  const delProblemSolution = useProblemSolutionsStore(
    (state) => state.delProblemSolution,
  );

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [copied, setCopied] = useState(false);

  const hasSolution = Boolean(solution?.code?.trim());

  useEffect(() => {
    if (open) {
      setCode(solution?.code ?? "");
      setLanguage(solution?.language ?? DEFAULT_LANGUAGE);
      setCopied(false);
    }
  }, [open, solution]);

  const highlighted = useMemo(
    () => highlightCode(code, language),
    [code, language],
  );

  const handleSave = () => {
    setProblemSolution(problemId, { code, language });
    setOpen(false);
  };

  const handleDelete = () => {
    delProblemSolution(problemId);
    setCode("");
    setLanguage(DEFAULT_LANGUAGE);
    setOpen(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(
            "size-9 border-green-300 bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900 dark:border-green-800 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/70",
            !hasSolution &&
              "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-900 dark:bg-green-950/50 dark:text-green-400",
          )}
          title={hasSolution ? "編輯我的題解" : "儲存我的題解"}
          aria-label={hasSolution ? "編輯我的題解" : "儲存我的題解"}
        >
          <Code2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] gap-4 overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="pr-7 text-base leading-snug">
            {problemId}. {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">語言</span>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[10rem]">
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
          </div>
        </div>

        <Tabs defaultValue="edit" className="w-full">
          <TabsList>
            <TabsTrigger value="edit">編輯</TabsTrigger>
            <TabsTrigger value="preview">預覽</TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="mt-3">
            <Textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="在此貼上你的程式碼解法..."
              className="min-h-[24rem] resize-y font-mono text-sm leading-6"
              spellCheck={false}
            />
          </TabsContent>
          <TabsContent value="preview" className="mt-3">
            {code.trim().length > 0 ? (
              <div className="relative overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-3 py-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    {LANGUAGE_OPTIONS.find((o) => o.value === language)?.label ??
                      language}
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
                    className={`hljs language-${language}`}
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                  />
                </pre>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground">
                尚未輸入程式碼。
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={!hasSolution}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            刪除
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
