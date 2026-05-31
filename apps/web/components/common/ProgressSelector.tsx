import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OptionKey, useOptions } from "@/hooks/useOptions";
import { useProblemProgress } from "@/features/userData";
import { cn } from "@/lib/utils";
import React, { useCallback, useMemo } from "react";

interface ProgressSelectorProps {
  problemId: string;
  triggerClassName?: string;
}

const ProgressSelector = React.memo(
  ({ problemId, triggerClassName }: ProgressSelectorProps) => {
    const { optionKeys, getOption } = useOptions();
    const { progress, setStatus, clearStatus } = useProblemProgress();
    const todoOption = getOption();
    const optValue = getOption(progress[problemId]);

    const handleSelect = useCallback(
      (key: OptionKey) => {
        if (key === todoOption.key) {
          clearStatus(problemId);
        } else {
          setStatus(problemId, key);
        }
      },
      [problemId, todoOption, clearStatus, setStatus],
    );

    const isOptionKey = useCallback(
      (value: string): value is OptionKey => {
        return optionKeys.some((key) => key === value);
      },
      [optionKeys],
    );

    const handleValueChange = useCallback(
      (value: string) => {
        if (!isOptionKey(value)) {
          console.error(`[ProgressSelector] Invalid option key: ${value}`);
          return;
        }

        handleSelect(value);
      },
      [handleSelect, isOptionKey],
    );

    const selectItems = useMemo(() => {
      return optionKeys.map((key) => {
        const option = getOption(key);
        return (
          <SelectItem
            key={key}
            value={key}
            className="flex items-center justify-between gap-2"
            style={{ color: option.color }}
          >
            <span>{option.label}</span>
          </SelectItem>
        );
      });
    }, [optionKeys, getOption]);

    return (
      <Select value={optValue.key} onValueChange={handleValueChange}>
        <SelectTrigger
          className={cn(
            "rounded-md dark:border-muted-foreground/20 dark:bg-muted/30",
            triggerClassName ?? "min-w-[7rem] max-w-[12rem]",
          )}
          title={optValue.label || optValue.key}
          style={{ color: optValue.color }}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          align="start"
          className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
        >
          {selectItems}
          {!optionKeys.includes(optValue.key) && (
            <SelectItem value={optValue.key} style={{ color: optValue.color }}>
              <span>{optValue.label}</span>
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    );
  },
);

ProgressSelector.displayName = "ProgressSelector";

export { ProgressSelector };
