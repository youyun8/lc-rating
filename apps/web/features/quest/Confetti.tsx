"use client";

import { useEffect, useMemo } from "react";

const CONFETTI_COLORS = [
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ec4899",
  "#8b5cf6",
  "#ef4444",
];
const PIECE_COUNT = 48;

interface ConfettiProps {
  /** Changing this value replays the burst. */
  burstId: number;
  onDone: () => void;
}

/** Lightweight CSS confetti burst; skipped for reduced-motion users via CSS. */
export function Confetti({ burstId, onDone }: ConfettiProps) {
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.6 + Math.random() * 1.2,
        drift: (Math.random() - 0.5) * 220,
        rotate: Math.random() * 720,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 6,
      })),
    // Regenerate for every burst.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burstId],
  );

  useEffect(() => {
    const timer = window.setTimeout(onDone, 3200);
    return () => window.clearTimeout(timer);
  }, [burstId, onDone]);

  return (
    <div
      aria-hidden
      className="quest-confetti pointer-events-none fixed inset-0 z-[60] overflow-hidden"
    >
      {pieces.map((piece, i) => (
        <span
          key={`${burstId}-${i}`}
          className="quest-confetti-piece"
          style={
            {
              left: `${piece.left}%`,
              width: piece.size,
              height: piece.size * 0.45,
              background: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              "--drift": `${piece.drift}px`,
              "--spin": `${piece.rotate}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
