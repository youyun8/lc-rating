import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import Fuse from "fuse.js";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TableCol } from "../ProblemTable/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-label";

const preciseSearch = (data: TableCol[], keyword: string) => {
  return data.map((row) => {
    const str = `${row.contest?.title || ""} ${row.problem.id} ${
      row.problem.title
    } ${row.solution?.title || ""} ${row.rating || ""} ${row.tags
      .map((t) => `${t.label.en} ${t.label.zh}`)
      ?.join(" ")}`.toLowerCase();

    const kws = keyword
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
        const matches = fuse.search(value).map((r) => ({
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
      []
    );

    return (
      <div className="w-full flex flex-col justify-center items-start gap-1">
      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="競賽、題目、題解搜尋"
          value={value}
          onChange={handleChange}
          className="w-full pl-9"
        />
      </div>
        <div className="flex items-center gap-2 p-1">
          <Checkbox
            checked={useFuse}
            onClick={() => {
              setUseFuse((v) => !v);
            }}
            id="fuse-search"
          />
          <Label htmlFor="fuse-search" className="text-sm cursor-pointer">模糊搜尋</Label>
        </div>
      </div>
    );
  }
);

WordFilter.displayName = "WordFilter";
export { WordFilter };