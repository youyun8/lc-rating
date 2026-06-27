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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudyPlanMarkdownContent } from "@/features/studyplan/MarkdownContent";
import { useProblemNote } from "@/features/userData";
import { cn } from "@/lib/utils";
import { Eye, Pencil, StickyNote, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ProblemNoteButtonProps {
  problemId: string;
  title: string;
  triggerClassName?: string;
}

export function ProblemNoteButton({
  problemId,
  title,
  triggerClassName,
}: ProblemNoteButtonProps) {
  const { note, setNote } = useProblemNote(problemId);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<"edit" | "preview">("preview");

  const hasNote = Boolean(note?.trim());

  useEffect(() => {
    if (open) {
      setDraft(note ?? "");
      setMode("preview");
    }
  }, [note, open]);

  const handleSave = () => {
    setNote(draft);
    setOpen(false);
  };

  const handleClear = () => {
    setNote("");
    setDraft("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={hasNote ? "success" : "outline"}
          size="sm"
          className={cn("h-9 min-w-9 gap-1.5 px-2.5", triggerClassName)}
          title={hasNote ? "查看我的筆記" : "新增我的筆記"}
          aria-label={hasNote ? "查看我的筆記" : "新增我的筆記"}
        >
          <StickyNote className="h-4 w-4" />
          {hasNote ? (
            <span className="size-1.5 rounded-full bg-current" aria-hidden />
          ) : null}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/60 px-5 py-4">
          <DialogTitle className="pr-7 text-base leading-snug">
            {problemId}. {title}
          </DialogTitle>
          <DialogDescription>
            記錄解題思路、卡點或複習提醒，支援 Markdown 語法。
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 px-5 py-4">
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as "edit" | "preview")}
          >
            <TabsList>
              <TabsTrigger value="edit">
                <Pencil />
                編輯
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye />
                預覽
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {mode === "edit" ? (
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="例如：關鍵觀察、容易漏掉的邊界條件、下次複習時要注意的地方...&#10;&#10;支援 **粗體**、`行內程式碼`、```cpp 程式碼區塊 ```、列表與數學公式。"
              className="min-h-56 w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-sm leading-6 shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          ) : (
            <div className="min-h-56 overflow-y-auto rounded-md border border-input bg-background px-4 py-3">
              {draft.trim() ? (
                <StudyPlanMarkdownContent
                  content={draft}
                  codeInitiallyOpen
                  className="prose-sm"
                />
              ) : (
                <p className="text-sm text-muted-foreground">尚無內容可預覽</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border/60 px-5 py-4 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            disabled={!hasNote && draft.trim().length === 0}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            清除
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
