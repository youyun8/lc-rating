/**
 * Data figures for the difficulty edition: the rating histogram in each
 * volume's guide and the small "three volumes" bar on every chapter opener.
 * Both are computed from the practice tables at build time.
 */
import { LEVELS, RATING_CUTS, VOLUMES, type Level } from "../difficulty";
import { C, line, rect, svg, text } from "./svg";

const BIN = 100;
const LO = 1100;
const HI = 3200;

/**
 * Histogram of practice-problem ratings. `ratings[level]` holds the ratings of
 * the problems listed in that volume; the current volume's bars are drawn in
 * its accent colour, the others in grey for context.
 */
export function ratingHistogram(
  ratings: Record<Level, number[]>,
  current: Level,
): string {
  const bins = (HI - LO) / BIN;
  const count = (rs: number[]) => {
    const out = Array<number>(bins).fill(0);
    for (const r of rs) {
      const i = Math.min(bins - 1, Math.max(0, Math.floor((r - LO) / BIN)));
      out[i]!++;
    }
    return out;
  };
  const per = Object.fromEntries(
    LEVELS.map((l) => [l, count(ratings[l])]),
  ) as Record<Level, number[]>;
  const totals = Array.from({ length: bins }, (_, i) =>
    LEVELS.reduce((s, l) => s + per[l][i]!, 0),
  );
  const maxY = Math.max(...totals, 1);
  const x0 = 46;
  const y0 = 30;
  const w = 540;
  const h = 170;
  const bw = w / bins;
  let body = "";
  // Volume bands.
  const band = (from: number, to: number, l: Level) => {
    const xa = x0 + ((Math.max(from, LO) - LO) / (HI - LO)) * w;
    const xb = x0 + ((Math.min(to, HI) - LO) / (HI - LO)) * w;
    const vol = VOLUMES[l];
    body += rect(xa, y0 - 22, xb - xa, h + 22, {
      fill: l === current ? vol.accentSoft : C.gray,
      stroke: "none",
    });
    body += text((xa + xb) / 2, y0 - 10, `${vol.name}（${vol.ordinal}）`, {
      size: 11.5,
      weight: "bold",
      fill: l === current ? vol.accent : C.muted,
    });
  };
  band(LO, RATING_CUTS.medium, "easy");
  band(RATING_CUTS.medium, RATING_CUTS.hard, "medium");
  band(RATING_CUTS.hard, HI, "hard");
  // Stacked bars: current volume on the bottom so it reads first.
  const order: Level[] = [current, ...LEVELS.filter((l) => l !== current)];
  for (let i = 0; i < bins; i++) {
    let y = y0 + h;
    for (const l of order) {
      const v = per[l][i]!;
      if (!v) continue;
      const bh = (v / maxY) * (h - 10);
      y -= bh;
      body += rect(x0 + i * bw + 2, y, bw - 4, bh, {
        fill: l === current ? VOLUMES[l].accent : C.line,
        stroke: C.paper,
        sw: 0.8,
      });
    }
  }
  body += line(x0, y0 + h, x0 + w, y0 + h, { sw: 1.2 });
  for (let r = LO; r <= HI; r += 300) {
    const x = x0 + ((r - LO) / (HI - LO)) * w;
    body += line(x, y0 + h, x, y0 + h + 5, { sw: 1 });
    body += text(x, y0 + h + 16, r === HI ? `${r}+` : r, {
      size: 10.5,
      mono: true,
      fill: C.muted,
    });
  }
  body += text(x0 - 8, y0 + h, "0", {
    anchor: "end",
    size: 10,
    fill: C.muted,
    mono: true,
  });
  body += text(x0 - 8, y0 + 10, maxY, {
    anchor: "end",
    size: 10,
    fill: C.muted,
    mono: true,
  });
  body += text(x0 + w / 2, y0 + h + 34, "練習題難度分數（每格 100 分）", {
    size: 11,
    fill: C.muted,
  });
  return svg(600, y0 + h + 44, body);
}

/** One-line bar: how a topic's sections are split across the three volumes. */
export function levelSpread(
  counts: Record<Level, number>,
  current: Level,
): string {
  const total = LEVELS.reduce((s, l) => s + counts[l], 0) || 1;
  const w = 600;
  const h = 26;
  let x = 0;
  let body = "";
  for (const l of LEVELS) {
    const n = counts[l];
    if (!n) continue;
    const vol = VOLUMES[l];
    const bw = Math.max(64, (n / total) * w);
    const cur = l === current;
    body += rect(x, 0, bw - 3, h, {
      fill: cur ? vol.accent : C.gray,
      stroke: cur ? vol.accent : C.line,
      sw: 1,
      rx: 3,
    });
    body += text(x + (bw - 3) / 2, h / 2 + 1, `${vol.mark}・${n} 節`, {
      size: 11.5,
      weight: "bold",
      fill: cur ? C.paper : C.muted,
    });
    x += bw;
  }
  // Rescale when the 64-unit minimum pushed the bar past the width.
  return svg(Math.max(w, x), h, body);
}
