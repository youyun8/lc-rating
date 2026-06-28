"use client";

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
import {
  useProblemSolutions,
  type ProblemSolution as ProblemSolutionType,
} from "@/features/userData";
import { cn } from "@/lib/utils";
import { Code2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { SolutionEditCard, SolutionViewCard } from "./SolutionCards";
import { createEmptySolution, type DialogMode } from "./solutionUtils";

interface ProblemSolutionProps {
  problemId: string;
  title: string;
}

export function ProblemSolution({ problemId, title }: ProblemSolutionProps) {
  const { solutions, setSolutions, delSolutions } =
    useProblemSolutions(problemId);

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
    setSolutions(drafts);
    const remaining = drafts.filter(
      (draft) => draft.code.trim().length > 0,
    ).length;
    if (remaining > 0) {
      setMode("view");
    } else {
      setOpen(false);
    }
  };

  const handleDeleteAll = () => {
    delSolutions();
    setOpen(false);
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
          variant="success"
          size="sm"
          className="h-9 min-w-9 gap-1.5 px-2.5 font-medium"
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
                variant="success"
                className="w-full"
                onClick={addDraft}
              >
                <Plus className="h-4 w-4" />
                新增題解
              </Button>
            </div>
          )}
        </div>

        <DialogFooter
          className={cn(
            "border-t border-border/60 px-5 py-4",
            mode === "view" ? "sm:justify-between" : "sm:justify-end",
          )}
        >
          {mode === "view" ? (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={handleDeleteAll}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                刪除所有題解
              </Button>
              <Button type="button" onClick={startEditing}>
                <Pencil className="h-4 w-4" />
                編輯題解
              </Button>
            </>
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
