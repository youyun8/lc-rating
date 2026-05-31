import { Badge } from "@/components/ui/badge";
import { useGlobalSettingsStore } from "@/hooks/useGlobalSettings";
import { useTags } from "@/hooks/useTags";
import React, { useCallback, useEffect, useState } from "react";
import { TableCol } from "../ProblemTable/types";

interface TagFilterProps {
  name: string;
  data: TableCol[];
  onChange: (idx: string, similarities: number[]) => void;
  registerReset: (idx: string, reset: () => void) => void;
}

const TagFilter = React.memo(
  ({ name, data, onChange, registerReset }: TagFilterProps) => {
    const [select, setSelect] = useState<Set<string>>(new Set());
    const tagLanguage = useGlobalSettingsStore((state) => state.tagLanguage);
    const isZh = tagLanguage === "zh";

    useEffect(() => {
      const onReset = () => {
        setSelect(new Set());
      };
      registerReset(name, onReset);
    }, [registerReset, name]);

    useEffect(() => {
      const results = data.map((row) =>
        Number(select.size === 0 || row.tags.some((tag) => select.has(tag.id))),
      );
      onChange(name, results);
    }, [data, select, onChange, name]);

    const handleChange = useCallback(
      (id: string) => {
        const newSelect = new Set(select);
        if (newSelect.has(id)) {
          newSelect.delete(id);
        } else {
          newSelect.add(id);
        }
        setSelect(newSelect);
      },
      [select],
    );

    const { tagMap = {} } = useTags();

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>可多選標籤，快速聚焦同類型題目。</span>
          <span>已選 {select.size}</span>
        </div>
        <div className="max-h-56 overflow-y-auto rounded-xl border border-border/60 bg-muted/20 p-3">
          <div className="flex flex-wrap justify-start gap-2">
            {Object.values(tagMap).map((tag) => (
              <Badge
                key={tag.id}
                variant={select.has(tag.id) ? "default" : "outline"}
                onClick={() => {
                  handleChange(tag.id);
                }}
                className="cursor-pointer text-sm"
              >
                {isZh ? tag.zh : tag.en}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  },
);

TagFilter.displayName = "TagFilter";
export { TagFilter };
