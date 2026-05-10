import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useProblemNotesStore } from "@/hooks/useProblemNotes";
import { cn } from "@/lib/utils";
import { FileText, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface ProblemNoteProps {
  problemId: string;
  title: string;
}

function createProblemNoteTemplate(problemId: string, title: string) {
  return `Problem:
LC ${problemId} - ${title}

Initial thought:

Pattern:

Key observation:

Complexity:

Lesson learned:
`;
}

export function ProblemNote({ problemId, title }: ProblemNoteProps) {
  const note = useProblemNotesStore(
    (state) => state.problemNotes[problemId] ?? "",
  );
  const setProblemNote = useProblemNotesStore((state) => state.setProblemNote);
  const delProblemNote = useProblemNotesStore((state) => state.delProblemNote);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(note);
  const hasNote = note.trim().length > 0;
  const template = useMemo(
    () => createProblemNoteTemplate(problemId, title),
    [problemId, title],
  );

  useEffect(() => {
    if (open) {
      setDraft(note || template);
    }
  }, [note, open, template]);

  const handleSave = () => {
    setProblemNote(problemId, draft);
    setOpen(false);
  };

  const handleDelete = () => {
    delProblemNote(problemId);
    setDraft(template);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={hasNote ? "secondary" : "outline"}
          size="icon"
          className={cn(
            "size-9",
            hasNote &&
              "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
          )}
          title={hasNote ? "編輯筆記" : "新增筆記"}
          aria-label={hasNote ? "編輯筆記" : "新增筆記"}
        >
          <FileText className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] gap-4 overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="pr-7 text-base leading-snug">
            {problemId}. {title}
          </DialogTitle>
        </DialogHeader>

        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="min-h-[22rem] resize-y font-mono text-sm leading-6"
          spellCheck={false}
        />

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={!hasNote}
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
