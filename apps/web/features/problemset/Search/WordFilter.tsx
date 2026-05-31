import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import Fuse from "fuse.js";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TableCol } from "../ProblemTable/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-label";
import { normalizeDisplayText } from "@/utils/normalizeDisplayText";

const preciseSearch = (data: TableCol[], keyword: string) => {
  const normalizedKeyword = normalizeDisplayText(keyword);

  return data.map((row) => {
    const str = `${row.contest?.title || ""} ${row.problem.id} ${
      row.problem.title
    } ${row.solution?.title || ""} ${row.rating || ""} ${row.tags
      .map((t) => `${t.label.en} ${t.label.zh}`)
      ?.join(" ")}`.toLowerCase();

    const kws = normalizedKeyword
      .toLowerCase()
      .split(" ")
      .map((kw) => kw.trim());

    return Number(kws.every((kw) => str.includes(kw)));
  });
};

const options = {
  ignoreDiacritics: true,
  ignoreLocation: true,
  includeScore: true,
  keys: ["contest.title", "problem.title", "problem.id", "solution.title"],
  minMatchCharLength: 1,
  threshold: 1,
};

interface WordFilterProps {
  name: string;
  data: TableCol[];
  onChange: (idx: string, similarities: number[]) => void;
  registerReset: (idx: string, reset: () => void) => void;
}

const WordFilter = React.memo(
  ({ name, data, onChange, registerReset }: WordFilterProps) => {
    const [useFuse, setUseFuse] = useState(true);
    const [value, setValue] = useState("");
    const fuse = useMemo(() => new Fuse(data, options), [data]);

    useEffect(() => {
      const onReset = () => {
        setValue("");
      };
      registerReset(name, onReset);
    }, [registerReset, name]);

    useEffect(() => {
      if (value && useFuse) {
        const matches = fuse.search(normalizeDisplayText(value)).map((r) => ({
          score: 1 - (r.score ? r.score : 1),
          idx: r.refIndex,
        }));
        const results = Array.from({ length: data.length }, () => 0);
        matches.forEach((m) => {
          results[m.idx] = m.score;
        });
        onChange(name, results);
      } else {
        const results = preciseSearch(data, value);
        onChange(name, results);
      }
    }, [useFuse, fuse, value, data, onChange, name]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
      },
      [],
    );

    return (
      <div className="flex w-full flex-col items-start justify-center gap-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">關鍵字搜尋</p>
          <p className="text-xs text-muted-foreground">
            支援競賽、題號、題目名稱與題解名稱；多個關鍵字可用空白分隔。
          </p>
        </div>
        <div className="relative w-full">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="例如：DP 301 binary search"
            value={value}
            onChange={handleChange}
            className="h-11 w-full pl-9"
          />
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
          <Checkbox
            checked={useFuse}
            onCheckedChange={() => setUseFuse((v) => !v)}
            id="fuse-search"
          />
          <Label htmlFor="fuse-search" className="cursor-pointer text-sm">
            模糊搜尋
          </Label>
          <span className="text-xs text-muted-foreground">
            關閉後會改用精確關鍵字比對
          </span>
        </div>
      </div>
    );
  },
);

WordFilter.displayName = "WordFilter";
export { WordFilter };
