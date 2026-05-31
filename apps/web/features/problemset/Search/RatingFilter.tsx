import { Button } from "@/components/ui-customized/button";
import { Slider } from "@/components/ui/slider";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { TableCol } from "../ProblemTable/types";

const buttons = [
  { label: "未知", min: 0, max: 1000 },
  { label: "[1000, 1200)", min: 1000, max: 1200 },
  { label: "[1200, 1400)", min: 1200, max: 1400 },
  { label: "[1400, 1600)", min: 1400, max: 1600 },
  { label: "[1600, 1900)", min: 1600, max: 1900 },
  { label: "[1900, 2100)", min: 1900, max: 2100 },
  { label: "[2100, 2400)", min: 2100, max: 2400 },
  { label: "[2400, 3000)", min: 2400, max: 3000 },
  { label: ">=3000", min: 3000, max: 4000 },
];

interface RatingFilterProps {
  name: string;
  data: TableCol[];
  onChange: (idx: string, similarities: number[]) => void;
  registerReset: (idx: string, reset: () => void) => void;
  onDebouncedConfirm?: () => void;
}

const RatingFilter = React.memo(
  ({
    name,
    data,
    onChange,
    registerReset,
    onDebouncedConfirm,
  }: RatingFilterProps) => {
    const [range, setRange] = useState<{ min: number; max: number }>({
      min: 0,
      max: 4000,
    });
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isDefaultRange = range.min === 0 && range.max === 4000;

    useEffect(() => {
      const onReset = () => {
        setRange({
          min: 0,
          max: 4000,
        });
      };
      registerReset(name, onReset);
    }, [registerReset, name]);

    useEffect(() => {
      const results = data.map((row) =>
        Number(row.rating >= range.min && row.rating < range.max),
      );
      onChange(name, results);

      // 防抖呼叫確認
      if (onDebouncedConfirm) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          onDebouncedConfirm();
        }, 200);
      }
    }, [data, range, onChange, name, onDebouncedConfirm]);

    // 清理計時器
    useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, []);

    const handleButtonClick = useCallback(
      (nextMin: number, nextMax: number) => {
        setRange(({ min, max }) => {
          if (min != nextMin || max != nextMax) {
            return { min: nextMin, max: nextMax };
          } else {
            return { min: 0, max: 4000 };
          }
        });
      },
      [],
    );

    const handleRangeChange = useCallback((newRange: [number, number]) => {
      setRange({
        min: newRange[0],
        max: newRange[1],
      });
    }, []);

    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">目前難度區間</p>
            <p className="text-xs text-muted-foreground">
              {isDefaultRange
                ? "全部難度"
                : `${range.min} - ${range.max === 4000 ? "4000+" : range.max}`}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            點選快速區間，或拖曳滑桿微調範圍
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {buttons.map((button, i) => (
            <Button
              key={i}
              variant={
                range.min === button.min && range.max === button.max
                  ? "default"
                  : "outline"
              }
              onClick={() => {
                handleButtonClick(button.min, button.max);
              }}
              className="h-auto px-2 py-1 text-xs sm:px-4 sm:text-sm"
            >
              {button.label}
            </Button>
          ))}
        </div>

        <div className="rounded-xl border border-border/60 bg-background px-4 py-4">
          <Slider
            value={[range.min, range.max]}
            onValueChange={handleRangeChange}
            min={0}
            max={4000}
            step={1}
            minStepsBetweenThumbs={1}
          />
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>2000</span>
            <span>4000+</span>
          </div>
        </div>
      </div>
    );
  },
);

RatingFilter.displayName = "RatingFilter";
export { RatingFilter };
