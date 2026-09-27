/**
 * Figures for Part I: sliding window & two pointers, binary search,
 * monotonic stack and grid graphs. Every state shown in a figure is produced
 * by actually running the algorithm on the example input, so the drawings
 * cannot drift from the code in the lectures.
 */
import type { BookFigure } from "./types";
import {
  C,
  array,
  axes,
  brace,
  chip,
  circle,
  curve,
  grid,
  legend,
  line,
  panelTitle,
  path,
  pointer,
  rect,
  svg,
  text,
} from "./svg";

const at = <T>(a: readonly T[], i: number): T => a[i] as T;

// ---------------------------------------------------------------------------
// Sliding window
// ---------------------------------------------------------------------------

function fixedWindow(): string {
  const nums = [2, 1, 5, 1, 3, 2];
  const k = 3;
  const cell = 44;
  const x0 = 110;
  let body = "";
  let sum = 0;
  let row = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += at(nums, i);
    if (i < k - 1) continue;
    const y = 36 + row * 78;
    const l = i - k + 1;
    body += text(20, y + cell / 2, `i = ${i}`, {
      anchor: "start",
      mono: true,
      size: 14,
    });
    body += array(x0, y, nums, {
      cell,
      fill: (j) => (j >= l && j <= i ? C.blueSoft : undefined),
      showIndex: row === 0,
      indexBelow: false,
    });
    body += rect(x0 + l * cell, y, k * cell, cell, {
      stroke: C.blue,
      sw: 2.6,
      rx: 3,
    });
    if (row > 0) {
      body += pointer(x0 + i * cell + cell / 2, y + cell, `+${at(nums, i)}`, {
        color: C.green,
        below: true,
        len: 14,
      });
      body += pointer(
        x0 + (l - 1) * cell + cell / 2,
        y + cell,
        `−${at(nums, l - 1)}`,
        { color: C.red, below: true, len: 14 },
      );
    }
    body += chip(x0 + nums.length * cell + 60, y + cell / 2, `sum = ${sum}`, {
      fill: C.blue,
    });
    sum -= at(nums, l);
    row++;
  }
  body += legend(110, 36 + row * 78 + 14, [
    [C.greenSoft, "進入視窗（加上）"],
    [C.redSoft, "離開視窗（減掉）"],
  ]);
  return svg(560, 36 + row * 78 + 30, body);
}

function longestNoRepeat(): string {
  const s = "abcabcbb";
  const cell = 34;
  const x0 = 90;
  const rowH = 44;
  let body = "";
  const seen = new Map<string, number>();
  let l = 0;
  let best = 0;
  for (let r = 0; r < s.length; r++) {
    const ch = s.charAt(r);
    const cnt = (seen.get(ch) ?? 0) + 1;
    seen.set(ch, cnt);
    let shrunk = 0;
    while ((seen.get(ch) ?? 0) > 1) {
      const lc = s.charAt(l);
      seen.set(lc, (seen.get(lc) ?? 0) - 1);
      l++;
      shrunk++;
    }
    const len = r - l + 1;
    const improved = len > best;
    best = Math.max(best, len);
    const y = 30 + r * rowH;
    body += text(24, y + cell / 2, `r=${r}`, {
      anchor: "start",
      mono: true,
      size: 13,
    });
    body += array(x0, y, s.split(""), {
      cell,
      h: cell - 4,
      size: 14,
      fill: (j) =>
        j >= l && j <= r ? (j === r ? C.orangeSoft : C.blueSoft) : undefined,
      dim: (j) => j > r,
    });
    body += rect(x0 + l * cell, y, len * cell, cell - 4, {
      stroke: C.blue,
      sw: 2.2,
      rx: 3,
    });
    const note =
      shrunk > 0 ? `'${ch}' 重複 → 左端右移 ${shrunk} 格` : "右端擴張";
    body += text(x0 + s.length * cell + 16, y + cell / 2 - 2, note, {
      anchor: "start",
      size: 12,
      fill: shrunk > 0 ? C.red : C.muted,
    });
    body += text(
      x0 + s.length * cell + 210,
      y + cell / 2 - 2,
      `len=${len}${improved ? "  ★" : ""}`,
      {
        anchor: "start",
        size: 12,
        mono: true,
        fill: improved ? C.orange : C.muted,
        weight: improved ? "bold" : undefined,
      },
    );
  }
  body += text(
    x0,
    30 + s.length * rowH + 8,
    `答案 = ${best}：每一步都維持「視窗內無重複」這個不變量，右端只增不減，左端也只增不減。`,
    {
      anchor: "start",
      size: 12,
      fill: C.ink,
    },
  );
  return svg(640, 30 + s.length * rowH + 24, body);
}

function minWindowSum(): string {
  const nums = [2, 3, 1, 2, 4, 3];
  const target = 7;
  const cell = 40;
  const x0 = 80;
  const rowH = 50;
  let body = "";
  let l = 0;
  let sum = 0;
  let best = Infinity;
  for (let r = 0; r < nums.length; r++) {
    sum += at(nums, r);
    const frames: { l: number; sum: number; valid: boolean }[] = [];
    while (sum >= target) {
      frames.push({ l, sum, valid: true });
      best = Math.min(best, r - l + 1);
      sum -= at(nums, l);
      l++;
    }
    const y = 24 + r * rowH;
    const shownL = frames.length ? at(frames, frames.length - 1).l : l;
    body += text(20, y + cell / 2, `r=${r}`, {
      anchor: "start",
      mono: true,
      size: 13,
    });
    body += array(x0, y, nums, {
      cell,
      h: cell - 4,
      fill: (j) =>
        j >= shownL && j <= r
          ? frames.length
            ? C.greenSoft
            : C.blueSoft
          : undefined,
      dim: (j) => j > r,
    });
    if (r >= shownL) {
      body += rect(x0 + shownL * cell, y, (r - shownL + 1) * cell, cell - 4, {
        stroke: frames.length ? C.green : C.blue,
        sw: 2.2,
        rx: 3,
      });
    }
    const msg = frames.length
      ? `sum≥${target}，收縮 ${frames.length} 次；最短 = ${r - shownL + 1}`
      : `sum = ${sum} < ${target}，繼續擴張`;
    body += text(x0 + nums.length * cell + 16, y + cell / 2 - 2, msg, {
      anchor: "start",
      size: 12,
      fill: frames.length ? C.green : C.muted,
    });
  }
  body += text(
    x0,
    24 + nums.length * rowH + 6,
    `綠框：合法的最短視窗（收縮到再縮就不合法）。答案 = ${best}`,
    {
      anchor: "start",
      size: 12,
    },
  );
  return svg(600, 24 + nums.length * rowH + 22, body);
}

function countShortValid(): string {
  const nums = [10, 5, 2, 6];
  const k = 100;
  const cell = 46;
  const x0 = 140;
  let body = "";
  // For r = 3 the window is [1, 3]; list every subarray ending at r.
  let l = 0;
  let prod = 1;
  const windows: [number, number][] = [];
  for (let r = 0; r < nums.length; r++) {
    prod *= at(nums, r);
    while (prod >= k) {
      prod /= at(nums, l);
      l++;
    }
    windows.push([l, r]);
  }
  const [L, R] = at(windows, 3);
  body += array(x0, 40, nums, {
    cell,
    showIndex: true,
    indexBelow: false,
    fill: (j) => (j >= L && j <= R ? C.blueSoft : undefined),
  });
  body += rect(x0 + L * cell, 40, (R - L + 1) * cell, cell, {
    stroke: C.blue,
    sw: 2.4,
    rx: 3,
  });
  body += pointer(x0 + L * cell + cell / 2, 40 + cell, "l", {
    below: true,
    len: 16,
  });
  body += pointer(x0 + R * cell + cell / 2, 40 + cell, "r", {
    below: true,
    len: 16,
    color: C.orange,
  });
  body += text(20, 40 + cell / 2, `k = ${k}`, {
    anchor: "start",
    mono: true,
    size: 13,
  });
  let y = 140;
  for (let s = R; s >= L; s--) {
    body += rect(x0 + s * cell + 3, y, (R - s + 1) * cell - 6, 18, {
      fill: C.greenSoft,
      stroke: C.green,
      rx: 9,
    });
    const prodSub = nums.slice(s, R + 1).reduce((a, b) => a * b, 1);
    body += text(
      x0 + R * cell + cell + 12,
      y + 9,
      `[${nums.slice(s, R + 1).join(",")}] 乘積 ${prodSub} < ${k}`,
      {
        anchor: "start",
        size: 12,
        fill: C.green,
      },
    );
    y += 26;
  }
  body += text(
    20,
    y + 14,
    `以 r 結尾的合法子陣列恰有 r − l + 1 = ${R - L + 1} 個：視窗 [l, r] 合法，其內任何更短的後綴也合法。`,
    {
      anchor: "start",
      size: 12,
    },
  );
  return svg(620, y + 30, body);
}

function countLongValid(): string {
  const cell = 42;
  const x0 = 60;
  const nums = [1, 4, 2, 3, 5, 1];
  const r = 4;
  const l = 3; // smallest window ending at r with sum >= 8: [3,5]
  let body = array(x0, 50, nums, {
    cell,
    showIndex: true,
    indexBelow: false,
    fill: (j) =>
      j >= l && j <= r ? C.greenSoft : j < l ? C.yellowSoft : undefined,
    dim: (j) => j > r,
  });
  body += rect(x0 + l * cell, 50, (r - l + 1) * cell, cell, {
    stroke: C.green,
    sw: 2.4,
    rx: 3,
  });
  body += pointer(x0 + l * cell + cell / 2, 50 + cell, "l", {
    below: true,
    len: 14,
  });
  body += pointer(x0 + r * cell + cell / 2, 50 + cell, "r", {
    below: true,
    len: 14,
    color: C.orange,
  });
  body += brace(
    x0,
    x0 + l * cell,
    50 - 24,
    `左端取 0..l−1 仍合法（共 l = ${l} 種）`,
    { above: true, color: C.orange },
  );
  body += text(
    x0,
    140,
    "條件：子陣列和 ≥ 8。收縮後 [l, r] 恰好「再縮一格就不合法」，",
    { anchor: "start", size: 12 },
  );
  body += text(
    x0,
    160,
    "因此把左端往左延伸（黃色）只會讓和更大，全部合法 → 答案累加 l。",
    { anchor: "start", size: 12 },
  );
  return svg(420, 176, body);
}

function exactlyK(): string {
  const W = 560;
  let body = "";
  const bar = (
    y: number,
    w: number,
    fill: string,
    label: string,
    sub: string,
  ) =>
    rect(40, y, w, 30, { fill, stroke: C.ink, rx: 4 }) +
    text(50, y + 15, label, { anchor: "start", size: 13, weight: "bold" }) +
    text(40 + w + 10, y + 15, sub, {
      anchor: "start",
      size: 12,
      fill: C.muted,
    });
  body += bar(20, 400, C.blueSoft, "atLeast(k)", "至少 k 個的子陣列");
  body += bar(64, 260, C.orangeSoft, "atLeast(k+1)", "至少 k+1 個");
  body += rect(300, 108, 140, 30, {
    fill: C.greenSoft,
    stroke: C.green,
    sw: 2,
    rx: 4,
  });
  body += text(370, 123, "exactly(k)", {
    size: 13,
    weight: "bold",
    fill: C.green,
  });
  body += line(300, 20, 300, 150, { dash: "4 3", stroke: C.line });
  body += line(440, 20, 440, 150, { dash: "4 3", stroke: C.line });
  body += text(
    40,
    168,
    "exactly(k) = atLeast(k) − atLeast(k+1)：兩個「越長越合法」的單調視窗相減。",
    {
      anchor: "start",
      size: 12,
    },
  );
  return svg(W, 184, body);
}

function twoSumSorted(): string {
  const nums = [1, 3, 4, 6, 8, 11];
  const target = 10;
  const cell = 42;
  const x0 = 70;
  const rowH = 80;
  let body = "";
  let l = 0;
  let r = nums.length - 1;
  let row = 0;
  for (;;) {
    const y = 34 + row * rowH;
    const s = at(nums, l) + at(nums, r);
    body += array(x0, y, nums, {
      cell,
      showIndex: row === 0,
      indexBelow: false,
      dim: (j) => j < l || j > r,
      fill: (j) =>
        j === l || j === r
          ? s === target
            ? C.greenSoft
            : C.blueSoft
          : undefined,
    });
    body += pointer(x0 + l * cell + cell / 2, y + cell, "l", {
      below: true,
      len: 12,
    });
    body += pointer(x0 + r * cell + cell / 2, y + cell, "r", {
      below: true,
      len: 12,
      color: C.orange,
    });
    const msg =
      s === target
        ? `${at(nums, l)}+${at(nums, r)} = ${s}，找到！`
        : s > target
          ? `${at(nums, l)}+${at(nums, r)} = ${s} > ${target}：nums[r] 太大，r−−`
          : `${at(nums, l)}+${at(nums, r)} = ${s} < ${target}：nums[l] 太小，l++`;
    body += text(x0 + nums.length * cell + 16, y + cell / 2, msg, {
      anchor: "start",
      size: 12,
      fill: s === target ? C.green : C.ink,
    });
    row++;
    if (s === target) break;
    if (s > target) r--;
    else l++;
  }
  body += text(
    x0,
    34 + row * rowH + 4,
    "每次比較都排除一整列（r 與更小的 l 全不可能）或一整行，所以 O(n)。",
    {
      anchor: "start",
      size: 12,
      fill: C.muted,
    },
  );
  return svg(640, 34 + row * rowH + 20, body);
}

function removeInPlace(): string {
  const nums0 = [3, 2, 2, 3, 4, 3, 5];
  const val = 3;
  const cell = 40;
  const x0 = 80;
  const rowH = 62;
  const nums = [...nums0];
  let slow = 0;
  let body = text(20, 14, `移除所有 val = ${val}（slow 指向下一個寫入位置）`, {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  for (let fast = 0; fast < nums.length; fast++) {
    const y = 32 + fast * rowH;
    const keep = at(nums, fast) !== val;
    const before = [...nums];
    if (keep) {
      nums[slow] = at(nums, fast);
    }
    body += array(x0, y, before, {
      cell,
      h: 32,
      fill: (j) =>
        j < slow
          ? C.greenSoft
          : j === fast
            ? keep
              ? C.blueSoft
              : C.redSoft
            : undefined,
    });
    const same = slow === fast;
    body += pointer(
      x0 + slow * cell + cell / 2 - (same ? 13 : 0),
      y + 32,
      "slow",
      { below: true, len: 8, size: 10, color: C.green },
    );
    body += pointer(
      x0 + fast * cell + cell / 2 + (same ? 15 : 0),
      y + 32,
      "fast",
      { below: true, len: 8, size: 10, color: C.orange },
    );
    body += text(
      x0 + nums.length * cell + 14,
      y + 16,
      keep ? `保留 ${at(before, fast)} → 寫到 slow，slow++` : `丟棄 ${val}`,
      {
        anchor: "start",
        size: 12,
        fill: keep ? C.blue : C.red,
      },
    );
    if (keep) slow++;
  }
  const y = 32 + nums.length * rowH;
  body += array(x0, y, nums, {
    cell,
    h: 32,
    fill: (j) => (j < slow ? C.greenSoft : C.gray),
    dim: (j) => j >= slow,
  });
  body += text(x0 + nums.length * cell + 14, y + 16, `結果長度 = ${slow}`, {
    anchor: "start",
    size: 12,
    weight: "bold",
    fill: C.green,
  });
  return svg(600, y + 44, body);
}

function expandCenter(): string {
  const s = "cabbad";
  const cell = 40;
  const x0 = 80;
  const rowH = 62;
  let body = "";
  let l = 2;
  let r = 3;
  let step = 0;
  for (;;) {
    const y = 30 + step * rowH;
    const ok = l >= 0 && r < s.length && s.charAt(l) === s.charAt(r);
    body += text(20, y + cell / 2, `第 ${step + 1} 步`, {
      anchor: "start",
      size: 12,
    });
    body += array(x0, y, s.split(""), {
      cell,
      showIndex: step === 0,
      indexBelow: false,
      fill: (j) =>
        j === l || j === r
          ? ok
            ? C.greenSoft
            : C.redSoft
          : j > l && j < r
            ? C.blueSoft
            : undefined,
    });
    body += pointer(x0 + l * cell + cell / 2, y + cell, "l", {
      below: true,
      len: 8,
      size: 11,
    });
    body += pointer(x0 + r * cell + cell / 2, y + cell, "r", {
      below: true,
      len: 8,
      size: 11,
      color: C.orange,
    });
    body += text(
      x0 + s.length * cell + 16,
      y + cell / 2,
      ok
        ? `s[${l}] = s[${r}] = '${s.charAt(l)}'，繼續向外`
        : `s[${l}]='${s.charAt(l)}' ≠ s[${r}]='${s.charAt(r)}'，停止`,
      {
        anchor: "start",
        size: 12,
        fill: ok ? C.green : C.red,
      },
    );
    step++;
    if (!ok) break;
    l--;
    r++;
  }
  const y = 30 + step * rowH + 12;
  body += text(
    20,
    y,
    `以 (2,3) 為中心的最長迴文是 s[${l + 1}..${r - 1}] = "${s.slice(l + 1, r)}"。`,
    { anchor: "start", size: 12, weight: "bold" },
  );
  body += text(
    20,
    y + 20,
    "奇數長度以單一字元為中心，偶數長度以相鄰兩字元為中心，共 2n − 1 個中心。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(560, y + 34, body);
}

function groupLoop(): string {
  const nums = [1, 3, 5, 4, 7, 9, 2, 3];
  const cell = 42;
  const x0 = 40;
  // Maximal strictly increasing runs.
  const groups: [number, number][] = [];
  let i = 0;
  while (i < nums.length) {
    const start = i;
    i++;
    while (i < nums.length && at(nums, i) > at(nums, i - 1)) i++;
    groups.push([start, i - 1]);
  }
  const fills = [C.blueSoft, C.orangeSoft, C.greenSoft, C.purpleSoft];
  let body = array(x0, 40, nums, {
    cell,
    showIndex: true,
    indexBelow: false,
    fill: (j) =>
      at(fills, groups.findIndex(([a, b]) => j >= a && j <= b) % fills.length),
  });
  groups.forEach(([a, b], gi) => {
    body += brace(
      x0 + a * cell + 3,
      x0 + (b + 1) * cell - 3,
      40 + cell + 6,
      `第 ${gi + 1} 組（長 ${b - a + 1}）`,
      { size: 11 },
    );
  });
  body += text(
    x0,
    132,
    "外層迴圈決定每組起點 start，內層把 i 推到本組最後；每個下標只被內層掃過一次 → O(n)。",
    {
      anchor: "start",
      size: 12,
    },
  );
  return svg(560, 148, body);
}

function isSubsequence(): string {
  const s = "ace";
  const t = "abcde";
  const cell = 42;
  const x0 = 100;
  let body = text(x0 - 14, 40 + cell / 2, "s", {
    anchor: "end",
    mono: true,
    size: 14,
    weight: "bold",
  });
  body += text(x0 - 14, 140 + cell / 2, "t", {
    anchor: "end",
    mono: true,
    size: 14,
    weight: "bold",
  });
  const matches: [number, number][] = [];
  let i = 0;
  for (let j = 0; j < t.length && i < s.length; j++) {
    if (t.charAt(j) === s.charAt(i)) {
      matches.push([i, j]);
      i++;
    }
  }
  const sx0 = x0 + cell;
  body += array(sx0, 40, s.split(""), { cell, fill: () => C.blueSoft });
  body += array(x0, 140, t.split(""), {
    cell,
    fill: (j) => (matches.some(([, mj]) => mj === j) ? C.greenSoft : undefined),
    showIndex: true,
  });
  for (const [mi, mj] of matches) {
    body += line(
      sx0 + mi * cell + cell / 2,
      40 + cell,
      x0 + mj * cell + cell / 2,
      140,
      {
        stroke: C.green,
        sw: 1.8,
        arrow: "end",
        marker: "ah-green",
      },
    );
  }
  body += text(
    x0,
    214,
    "t 上的指標每步右移；遇到 s 的下一個字元就配對（貪心地取最早位置）。",
    { anchor: "start", size: 12 },
  );
  return svg(560, 230, body);
}

function matrixStaircase(): string {
  const m = [
    [1, 4, 7, 11],
    [2, 5, 8, 12],
    [3, 6, 9, 16],
    [10, 13, 14, 17],
  ];
  const target = 6;
  const cell = 44;
  const x0 = 60;
  const y0 = 40;
  const pathCells: [number, number][] = [];
  let r = 0;
  let c = 3;
  while (r < 4 && c >= 0) {
    pathCells.push([r, c]);
    const v = at(at(m, r), c);
    if (v === target) break;
    if (v > target) c--;
    else r++;
  }
  let body = grid(x0, y0, 4, 4, {
    cell,
    label: (rr, cc) => at(at(m, rr), cc),
    fill: (rr, cc) => {
      const idx = pathCells.findIndex(([a, b]) => a === rr && b === cc);
      if (idx === pathCells.length - 1) return C.greenSoft;
      if (idx >= 0) return C.blueSoft;
      return undefined;
    },
    size: 14,
  });
  for (let k = 1; k < pathCells.length; k++) {
    const [r1, c1] = at(pathCells, k - 1);
    const [r2, c2] = at(pathCells, k);
    const down = r2 > r1;
    const cx1 = x0 + c1 * cell + cell / 2;
    const cy1 = y0 + r1 * cell + cell / 2;
    const cx2 = x0 + c2 * cell + cell / 2;
    const cy2 = y0 + r2 * cell + cell / 2;
    body += line(
      down ? cx1 : cx1 - 13,
      down ? cy1 + 10 : cy1,
      down ? cx2 : cx2 + 13,
      down ? cy2 - 10 : cy2,
      {
        stroke: C.orange,
        sw: 2,
        arrow: "end",
        marker: "ah-orange",
      },
    );
  }
  body += text(x0 + 4 * cell + 20, y0 + 16, `找 target = ${target}`, {
    anchor: "start",
    size: 13,
    weight: "bold",
  });
  body += text(x0 + 4 * cell + 20, y0 + 44, "從右上角出發：", {
    anchor: "start",
    size: 12,
  });
  body += text(x0 + 4 * cell + 20, y0 + 66, "・太大 → 整行都太大，左移", {
    anchor: "start",
    size: 12,
  });
  body += text(x0 + 4 * cell + 20, y0 + 88, "・太小 → 整列都太小，下移", {
    anchor: "start",
    size: 12,
  });
  body += text(x0 + 4 * cell + 20, y0 + 110, "・最多走 m + n 步", {
    anchor: "start",
    size: 12,
  });
  return svg(520, y0 + 4 * cell + 20, body);
}

// ---------------------------------------------------------------------------
// Binary search
// ---------------------------------------------------------------------------

function lowerBoundTrace(nums: number[], target: number) {
  const frames: { l: number; r: number; m: number; go: "left" | "right" }[] =
    [];
  let l = 0;
  let r = nums.length - 1;
  while (l <= r) {
    const m = l + Math.floor((r - l) / 2);
    if (at(nums, m) >= target) {
      frames.push({ l, r, m, go: "left" });
      r = m - 1;
    } else {
      frames.push({ l, r, m, go: "right" });
      l = m + 1;
    }
  }
  return { frames, l, r };
}

function bsEndState(): string {
  const nums = [5, 7, 7, 8, 8, 10];
  const target = 8;
  const { l, r } = lowerBoundTrace(nums, target);
  const cell = 52;
  const x0 = 80;
  let body = array(x0, 70, nums, {
    cell,
    showIndex: true,
    fill: (j) => (j <= r ? C.redSoft : C.blueSoft),
    size: 16,
  });
  body += pointer(x0 + r * cell + cell / 2, 70, "R", {
    color: C.red,
    len: 22,
    size: 15,
  });
  body += pointer(x0 + l * cell + cell / 2, 70, "L", {
    color: C.blue,
    len: 22,
    size: 15,
  });
  body += brace(
    x0 + 2,
    x0 + (r + 1) * cell - 2,
    70 + cell + 24,
    `nums[i] < ${target}（紅）`,
    { color: C.red },
  );
  body += brace(
    x0 + l * cell + 2,
    x0 + nums.length * cell - 2,
    70 + cell + 24,
    `nums[i] ≥ ${target}（藍）`,
    { color: C.blue },
  );
  body += text(
    x0,
    196,
    `迴圈結束時 L = R + 1 = ${l}：R 左側（含）全紅、L 右側（含）全藍，答案就是 L。`,
    {
      anchor: "start",
      size: 12,
    },
  );
  return svg(560, 212, body);
}

function bsTrace(): string {
  const nums = [5, 7, 7, 8, 8, 10];
  const target = 8;
  const { frames, l, r } = lowerBoundTrace(nums, target);
  const cell = 44;
  const x0 = 90;
  const rowH = 84;
  let body = text(20, 14, `閉區間 [L, R] 找第一個 ≥ ${target} 的位置`, {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  frames.forEach((f, k) => {
    const y = 50 + k * rowH;
    body += text(20, y + cell / 2, `第 ${k + 1} 輪`, {
      anchor: "start",
      size: 12,
    });
    body += array(x0, y, nums, {
      cell,
      dim: (j) => j < f.l || j > f.r,
      fill: (j) =>
        j === f.m
          ? C.orangeSoft
          : j < f.l
            ? C.redSoft
            : j > f.r
              ? C.blueSoft
              : undefined,
    });
    body += pointer(
      x0 + f.l * cell + cell / 2 - (f.l === f.m ? 9 : 0),
      y,
      "L",
      { color: C.blue, len: 12, size: 11 },
    );
    body += pointer(
      x0 + f.r * cell + cell / 2 + (f.r === f.m ? 9 : 0),
      y,
      "R",
      { color: C.red, len: 12, size: 11 },
    );
    body += pointer(x0 + f.m * cell + cell / 2, y + cell, "M", {
      color: C.orange,
      below: true,
      len: 10,
      size: 11,
    });
    const v = at(nums, f.m);
    body += text(
      x0 + nums.length * cell + 16,
      y + cell / 2,
      f.go === "left"
        ? `nums[M]=${v} ≥ ${target} → R = M−1`
        : `nums[M]=${v} < ${target} → L = M+1`,
      {
        anchor: "start",
        size: 12,
        mono: true,
      },
    );
  });
  const y = 50 + frames.length * rowH;
  body += array(x0, y, nums, {
    cell,
    showIndex: true,
    fill: (j) => (j <= r ? C.redSoft : C.blueSoft),
  });
  body += text(20, y + cell / 2, "結束", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(
    x0 + nums.length * cell + 16,
    y + cell / 2,
    `L = ${l} > R = ${r}，回傳 L`,
    { anchor: "start", size: 12, weight: "bold", fill: C.blue },
  );
  return svg(620, y + cell + 24, body);
}

function bsConversions(): string {
  const nums = [5, 7, 7, 8, 8, 10];
  const cell = 46;
  const x0 = 150;
  let body = array(x0, 30, nums, { cell, showIndex: true });
  const rows: [string, number, string][] = [
    ["≥ 8", 3, "lower_bound(8)"],
    ["> 8", 5, "lower_bound(8 + 1)"],
    ["< 8（最後一個）", 2, "lower_bound(8) − 1"],
    ["≤ 8（最後一個）", 4, "lower_bound(8 + 1) − 1"],
  ];
  rows.forEach(([label, idx, formula], k) => {
    const y = 120 + k * 36;
    body += text(20, y, label, { anchor: "start", size: 13, weight: "bold" });
    body += line(
      x0 + idx * cell + cell / 2,
      30 + cell + 18,
      x0 + idx * cell + cell / 2,
      y - 10,
      { stroke: C.faint, sw: 1 },
    );
    body += circle(x0 + idx * cell + cell / 2, y, 7, {
      fill: C.blue,
      stroke: C.blue,
    });
    body += text(x0 + nums.length * cell + 20, y, `下標 ${idx} = ${formula}`, {
      anchor: "start",
      size: 12,
      mono: true,
      fill: C.blue,
    });
  });
  body += text(
    20,
    120 + rows.length * 36 + 4,
    "整數陣列上四種查詢都能化成同一個「第一個 ≥ x」的二分。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 120 + rows.length * 36 + 18, body);
}

function bsAnswerMin(): string {
  const piles = [3, 6, 7, 11];
  const h = 8;
  const ks = Array.from({ length: 11 }, (_, i) => i + 1);
  const hours = ks.map((k) => piles.reduce((s, p) => s + Math.ceil(p / k), 0));
  const x0 = 60;
  const y0 = 30;
  const H = 180;
  const bw = 40;
  const maxH = Math.max(...hours);
  let body = axes(x0, y0, ks.length * bw + 30, H, {
    xLabel: "速度 k",
    yLabel: "所需時數 hours(k)",
  });
  const ans = ks.find((_, i) => at(hours, i) <= h) ?? 0;
  ks.forEach((k, i) => {
    const hh = (at(hours, i) / maxH) * (H - 20);
    const ok = at(hours, i) <= h;
    body += rect(x0 + 8 + i * bw, y0 + H - hh, bw - 10, hh, {
      fill: ok ? C.greenSoft : C.redSoft,
      stroke: ok ? C.green : C.red,
      sw: k === ans ? 2.4 : 1,
    });
    body += text(
      x0 + 8 + i * bw + (bw - 10) / 2,
      y0 + H - hh - 8,
      at(hours, i),
      { size: 11, mono: true },
    );
    body += text(x0 + 8 + i * bw + (bw - 10) / 2, y0 + H + 12, k, {
      size: 11,
      mono: true,
      fill: C.muted,
    });
    body += text(x0 + 8 + i * bw + (bw - 10) / 2, y0 + H + 32, ok ? "T" : "F", {
      size: 12,
      weight: "bold",
      fill: ok ? C.green : C.red,
    });
  });
  const hy = y0 + H - (h / maxH) * (H - 20);
  body += line(x0, hy, x0 + ks.length * bw + 20, hy, {
    stroke: C.blue,
    dash: "5 4",
    sw: 1.5,
  });
  body += text(x0 + ks.length * bw + 24, hy, `h = ${h}`, {
    anchor: "start",
    size: 12,
    fill: C.blue,
    weight: "bold",
  });
  body += pointer(
    x0 + 8 + (ans - 1) * bw + (bw - 10) / 2,
    y0 + H + 44,
    `答案 k = ${ans}`,
    { below: true, color: C.green, len: 12 },
  );
  body += text(x0 + 200, y0 + 10, `piles = [${piles.join(", ")}]`, {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.muted,
  });
  return svg(600, y0 + H + 82, body);
}

function bsAnswerMax(): string {
  const candies = [5, 8, 6];
  const k = 3;
  const xs = Array.from({ length: 8 }, (_, i) => i + 1);
  const cnt = xs.map((x) => candies.reduce((s, c) => s + Math.floor(c / x), 0));
  const x0 = 60;
  const y0 = 30;
  const H = 170;
  const bw = 48;
  const maxC = Math.max(...cnt);
  let body = axes(x0, y0, xs.length * bw + 30, H, {
    xLabel: "每人分到 x 顆",
    yLabel: "可分出的份數 cnt(x)",
  });
  let ans = 0;
  xs.forEach((x, i) => {
    if (at(cnt, i) >= k) ans = x;
  });
  xs.forEach((x, i) => {
    const hh = (at(cnt, i) / maxC) * (H - 20);
    const ok = at(cnt, i) >= k;
    body += rect(x0 + 8 + i * bw, y0 + H - hh, bw - 14, hh, {
      fill: ok ? C.greenSoft : C.redSoft,
      stroke: ok ? C.green : C.red,
      sw: x === ans ? 2.4 : 1,
    });
    body += text(x0 + 8 + i * bw + (bw - 14) / 2, y0 + H - hh - 8, at(cnt, i), {
      size: 11,
      mono: true,
    });
    body += text(x0 + 8 + i * bw + (bw - 14) / 2, y0 + H + 12, x, {
      size: 11,
      mono: true,
      fill: C.muted,
    });
    body += text(x0 + 8 + i * bw + (bw - 14) / 2, y0 + H + 32, ok ? "T" : "F", {
      size: 12,
      weight: "bold",
      fill: ok ? C.green : C.red,
    });
  });
  const hy = y0 + H - (k / maxC) * (H - 20);
  body += line(x0, hy, x0 + xs.length * bw + 20, hy, {
    stroke: C.blue,
    dash: "5 4",
    sw: 1.5,
  });
  body += text(x0 + xs.length * bw + 24, hy, `k = ${k}`, {
    anchor: "start",
    size: 12,
    fill: C.blue,
    weight: "bold",
  });
  body += pointer(
    x0 + 8 + (ans - 1) * bw + (bw - 14) / 2,
    y0 + H + 44,
    `答案 x = ${ans}（最後一個 T）`,
    { below: true, color: C.green, len: 12 },
  );
  body += text(x0 + 220, y0 + 6, `candies = [${candies.join(", ")}]`, {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.muted,
  });
  return svg(560, y0 + H + 82, body);
}

function bsMinMax(): string {
  const nums = [7, 2, 5, 10, 8];
  const cell = 46;
  const x0 = 150;
  const split = (mx: number) => {
    const groups: [number, number][] = [];
    let s = 0;
    let start = 0;
    nums.forEach((v, i) => {
      if (s + v > mx) {
        groups.push([start, i - 1]);
        start = i;
        s = 0;
      }
      s += v;
    });
    groups.push([start, nums.length - 1]);
    return groups;
  };
  let body = "";
  const fills = [C.blueSoft, C.orangeSoft, C.greenSoft];
  [18, 17].forEach((mx, row) => {
    const y = 34 + row * 110;
    const groups = split(mx);
    const ok = groups.length <= 2;
    body += text(20, y + cell / 2 - 8, `上限 mx = ${mx}`, {
      anchor: "start",
      size: 13,
      weight: "bold",
    });
    body += text(
      20,
      y + cell / 2 + 12,
      `${groups.length} 段 ${ok ? "≤" : ">"} k=2 → ${ok ? "可行" : "不可行"}`,
      {
        anchor: "start",
        size: 12,
        fill: ok ? C.green : C.red,
      },
    );
    body += array(x0, y, nums, {
      cell,
      fill: (j) =>
        at(fills, groups.findIndex(([a, b]) => j >= a && j <= b) % 3),
    });
    groups.forEach(([a, b]) => {
      const sum = nums.slice(a, b + 1).reduce((p, q) => p + q, 0);
      body += brace(
        x0 + a * cell + 3,
        x0 + (b + 1) * cell - 3,
        y + cell + 6,
        `和 ${sum}`,
        { size: 11 },
      );
    });
  });
  body += text(
    20,
    250,
    "check(mx)：貪心地「能塞就塞」，數出最少要切幾段。mx 越大段數越少——單調，所以能二分 mx。",
    {
      anchor: "start",
      size: 12,
    },
  );
  return svg(600, 266, body);
}

function bsMaxMin(): string {
  const pos = [1, 2, 3, 4, 7];
  const m = 3;
  const x0 = 50;
  const scale = 60;
  let body = "";
  [3, 4].forEach((d, row) => {
    const y = 50 + row * 90;
    body += line(x0, y, x0 + 7 * scale + 20, y, {
      stroke: C.line,
      arrow: "end",
      marker: "ah-muted",
    });
    const chosen: number[] = [];
    let last = -Infinity;
    for (const p of pos) {
      if (p - last >= d) {
        chosen.push(p);
        last = p;
      }
    }
    for (const p of pos) {
      const x = x0 + (p - 1) * scale;
      body += circle(x, y, 9, {
        fill: chosen.includes(p) ? C.blue : C.paper,
        stroke: chosen.includes(p) ? C.blue : C.line,
      });
      body += text(x, y + 22, p, { size: 11, mono: true, fill: C.muted });
    }
    for (let i = 1; i < chosen.length; i++) {
      const a = x0 + (at(chosen, i - 1) - 1) * scale;
      const b = x0 + (at(chosen, i) - 1) * scale;
      body += curve(a, y - 12, b, y - 12, -16, { stroke: C.blue, sw: 1.4 });
      body += text((a + b) / 2, y - 28, `≥${d}`, { size: 11, fill: C.blue });
    }
    const ok = chosen.length >= m;
    body += text(x0 + 7 * scale + 40, y - 6, `d = ${d}`, {
      anchor: "start",
      size: 13,
      weight: "bold",
    });
    body += text(
      x0 + 7 * scale + 40,
      y + 14,
      `放得下 ${chosen.length} 顆 ${ok ? "≥" : "<"} ${m}`,
      {
        anchor: "start",
        size: 12,
        fill: ok ? C.green : C.red,
      },
    );
  });
  body += text(
    x0,
    226,
    "check(d)：從左到右，距離上一顆 ≥ d 就放。d 越大放得越少——找最後一個可行的 d。",
    { anchor: "start", size: 12 },
  );
  return svg(620, 242, body);
}

function bsKthMatrix(): string {
  const m = [
    [1, 5, 9],
    [10, 11, 13],
    [12, 13, 15],
  ];
  const k = 8;
  const cell = 50;
  const x0 = 50;
  const y0 = 40;
  const count = (x: number) => m.flat().filter((v) => v <= x).length;
  let body = "";
  [12, 13].forEach((x, idx) => {
    const ox = x0 + idx * 270;
    const c = count(x);
    body += panelTitle(
      ox,
      y0 - 18,
      `x = ${x}：count(≤x) = ${c} ${c >= k ? "≥" : "<"} k=${k}`,
      { color: c >= k ? C.green : C.red },
    );
    body += grid(ox, y0, 3, 3, {
      cell,
      label: (r, cc) => at(at(m, r), cc),
      fill: (r, cc) =>
        at(at(m, r), cc) <= x ? (c >= k ? C.greenSoft : C.redSoft) : undefined,
      size: 15,
    });
    // Staircase boundary.
    let d = "";
    for (let r = 0; r < 3; r++) {
      const row = at(m, r);
      const len = row.filter((v) => v <= x).length;
      const px = ox + len * cell;
      d += r === 0 ? `M${px},${y0}` : ` L${px},${y0 + r * cell}`;
      d += ` L${px},${y0 + (r + 1) * cell}`;
    }
    body += path(d, { stroke: C.orange, sw: 3 });
  });
  body += text(
    x0,
    y0 + 3 * cell + 30,
    "以值域二分：count(≤x) 沿著階梯邊界 O(n) 算出；第一個 count ≥ k 的 x 就是第 k 小（此處為 13）。",
    {
      anchor: "start",
      size: 12,
    },
  );
  return svg(600, y0 + 3 * cell + 46, body);
}

function ternary(): string {
  const x0 = 50;
  const y0 = 20;
  const W = 440;
  const H = 180;
  const f = (t: number) => -(t - 0.62) * (t - 0.62);
  const pts: string[] = [];
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const px = x0 + t * W;
    const py = y0 + H - 10 - ((f(t) + 0.4) / 0.4) * (H - 30);
    pts.push(`${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`);
  }
  let body = axes(x0, y0, W + 20, H, { xLabel: "x", yLabel: "f(x)" });
  const m1 = 1 / 3;
  const m2 = 2 / 3;
  const X = (t: number) => x0 + t * W;
  const Y = (t: number) => y0 + H - 10 - ((f(t) + 0.4) / 0.4) * (H - 30);
  body += rect(X(0), y0, X(m1) - X(0), H, { fill: C.gray, stroke: "none" });
  body += text((X(0) + X(m1)) / 2, y0 + 16, "捨棄 [l, m1)", {
    size: 12,
    fill: C.muted,
  });
  body += path(pts.join(" "), { stroke: C.blue, sw: 2.4 });
  for (const [t, name] of [
    [m1, "m1"],
    [m2, "m2"],
  ] as const) {
    body += line(X(t), y0 + H, X(t), Y(t), { dash: "4 3", stroke: C.orange });
    body += circle(X(t), Y(t), 5, { fill: C.orange, stroke: C.orange });
    body += text(X(t), y0 + H + 14, name, {
      mono: true,
      size: 12,
      fill: C.orange,
      weight: "bold",
    });
  }
  body += text(X(0), y0 + H + 14, "l", { mono: true, size: 12 });
  body += text(X(1), y0 + H + 14, "r", { mono: true, size: 12 });
  body += text(
    x0,
    y0 + H + 42,
    "f(m1) < f(m2)：最大值不可能在 m1 左邊（單峰函數在峰左側遞增），丟掉 [l, m1)。",
    { anchor: "start", size: 12 },
  );
  return svg(540, y0 + H + 58, body);
}

// ---------------------------------------------------------------------------
// Monotonic stack
// ---------------------------------------------------------------------------

function dailyTemperatures(): string {
  const t = [73, 74, 75, 71, 69, 72, 76, 73];
  const ans = new Array<number>(t.length).fill(0);
  const cols = ["i", "t[i]", "彈出並結算", "堆疊（底 → 頂，存下標:值）"];
  const colX = [30, 80, 150, 350];
  const rowH = 30;
  let body = "";
  cols.forEach((c, k) => {
    body += text(at(colX, k), 20, c, {
      anchor: "start",
      size: 12,
      weight: "bold",
    });
  });
  body += line(20, 32, 640, 32, { stroke: C.ink, sw: 1 });
  const st: number[] = [];
  t.forEach((v, i) => {
    const popped: string[] = [];
    while (st.length && at(t, at(st, st.length - 1)) < v) {
      const j = st.pop() as number;
      ans[j] = i - j;
      popped.push(`ans[${j}]=${i - j}`);
    }
    st.push(i);
    const y = 50 + i * rowH;
    if (i % 2 === 1)
      body += rect(20, y - rowH / 2, 620, rowH, {
        fill: C.gray,
        stroke: "none",
      });
    body += text(at(colX, 0), y, i, { anchor: "start", mono: true });
    body += text(at(colX, 1), y, v, { anchor: "start", mono: true });
    body += text(at(colX, 2), y, popped.join(", ") || "—", {
      anchor: "start",
      size: 12,
      mono: true,
      fill: popped.length ? C.orange : C.line,
    });
    st.forEach((j, k) => {
      body += rect(at(colX, 3) + k * 58, y - 11, 54, 22, {
        fill: j === i ? C.blueSoft : C.paper,
        stroke: C.ink,
        sw: 1,
        rx: 3,
      });
      body += text(at(colX, 3) + k * 58 + 27, y, `${j}:${at(t, j)}`, {
        size: 11,
        mono: true,
      });
    });
  });
  const y = 50 + t.length * rowH + 6;
  body += text(
    30,
    y,
    `ans = [${ans.join(", ")}]\u3000堆疊內對應的溫度由底到頂嚴格遞減；新元素把比它小的堆頂全部彈出並結算。`,
    {
      anchor: "start",
      size: 12,
    },
  );
  return svg(660, y + 16, body);
}

function nextGreaterArcs(): string {
  const nums = [2, 1, 2, 4, 3, 1, 5];
  const n = nums.length;
  const nge = new Array<number>(n).fill(-1);
  const st: number[] = [];
  nums.forEach((v, i) => {
    while (st.length && at(nums, at(st, st.length - 1)) < v)
      nge[st.pop() as number] = i;
    st.push(i);
  });
  const cell = 56;
  const x0 = 40;
  const base = 190;
  let body = "";
  nums.forEach((v, i) => {
    const h = v * 26;
    body += rect(x0 + i * cell + 8, base - h, cell - 16, h, {
      fill: nge[i] === -1 ? C.gray : C.blueSoft,
      stroke: C.ink,
      sw: 1,
    });
    body += text(x0 + i * cell + cell / 2, base + 14, v, {
      mono: true,
      size: 13,
    });
    body += text(x0 + i * cell + cell / 2, base + 30, i, {
      mono: true,
      size: 10,
      fill: C.muted,
    });
  });
  nums.forEach((v, i) => {
    const j = at(nge, i);
    if (j < 0) return;
    const x1 = x0 + i * cell + cell / 2;
    const x2 = x0 + j * cell + cell / 2;
    const top = base - Math.max(v, at(nums, j)) * 26 - 8;
    body += path(
      `M${x1},${base - v * 26 - 2} C${x1},${top - 20 - (j - i) * 6} ${x2},${top - 20 - (j - i) * 6} ${x2},${base - at(nums, j) * 26 - 4}`,
      {
        stroke: C.orange,
        sw: 1.6,
        arrow: "end",
        marker: "ah-orange",
      },
    );
  });
  body += text(
    x0,
    base + 54,
    "每條弧從 i 指向「右邊第一個更大元素」；灰色柱子右側沒有更大元素。弧兩兩不交叉——正是堆疊結構。",
    {
      anchor: "start",
      size: 12,
    },
  );
  return svg(640, base + 68, body);
}

function histogram(): string {
  const h = [2, 1, 5, 6, 2, 3];
  const n = h.length;
  const left = new Array<number>(n).fill(-1);
  const right = new Array<number>(n).fill(n);
  const st: number[] = [];
  h.forEach((v, i) => {
    while (st.length && at(h, at(st, st.length - 1)) >= v)
      right[st.pop() as number] = i;
    left[i] = st.length ? at(st, st.length - 1) : -1;
    st.push(i);
  });
  let best = 0;
  let bi = 0;
  h.forEach((v, i) => {
    const area = v * (at(right, i) - at(left, i) - 1);
    if (area > best) {
      best = area;
      bi = i;
    }
  });
  const unit = 26;
  const cw = 52;
  const x0 = 50;
  const base = 200;
  let body = "";
  const L = at(left, bi);
  const R = at(right, bi);
  body += rect(
    x0 + (L + 1) * cw,
    base - at(h, bi) * unit,
    (R - L - 1) * cw,
    at(h, bi) * unit,
    { fill: C.orangeSoft, stroke: "none" },
  );
  h.forEach((v, i) => {
    body += rect(x0 + i * cw, base - v * unit, cw, v * unit, {
      fill: i === bi ? C.blueMid : C.blueSoft,
      stroke: C.ink,
      sw: 1.1,
      opacity: 0.9,
    });
    body += text(x0 + i * cw + cw / 2, base - v * unit - 10, v, {
      mono: true,
      size: 12,
    });
    body += text(x0 + i * cw + cw / 2, base + 14, i, {
      mono: true,
      size: 11,
      fill: C.muted,
    });
  });
  body += rect(
    x0 + (L + 1) * cw,
    base - at(h, bi) * unit,
    (R - L - 1) * cw,
    at(h, bi) * unit,
    { stroke: C.orange, sw: 2.6 },
  );
  body += pointer(x0 + L * cw + cw / 2, base + 22, `left=${L}`, {
    below: true,
    color: C.red,
    len: 14,
  });
  body += pointer(x0 + R * cw + cw / 2, base + 22, `right=${R}`, {
    below: true,
    color: C.red,
    len: 14,
  });
  const tx = x0 + n * cw + 24;
  body += text(tx, 60, `以 h[${bi}] = ${at(h, bi)} 為高：`, {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(tx, 82, "向左、向右找第一個更矮的柱子", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 104, `寬 = right − left − 1 = ${R - L - 1}`, {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(tx, 126, `面積 = ${at(h, bi)} × ${R - L - 1} = ${best}`, {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.orange,
    weight: "bold",
  });
  body += text(tx, 156, "左右邊界各用一次單調堆疊求出，", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 176, "每根柱子當一次「最矮者」。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(600, base + 60, body);
}

function contribution(): string {
  const arr = [3, 1, 2, 4];
  const i = 1;
  const cell = 52;
  const x0 = 70;
  let body = array(x0, 50, arr, {
    cell,
    showIndex: true,
    indexBelow: false,
    fill: (j) => (j === i ? C.orangeSoft : C.blueSoft),
  });
  body += text(x0 - 10, 50 + cell / 2, "−1", {
    anchor: "end",
    mono: true,
    size: 12,
    fill: C.muted,
  });
  body += text(x0 + arr.length * cell + 12, 50 + cell / 2, "n=4", {
    anchor: "start",
    mono: true,
    size: 12,
    fill: C.muted,
  });
  body += brace(x0 + 3, x0 + (i + 1) * cell - 3, 50 + cell + 8, "左端：2 種", {
    color: C.blue,
  });
  body += brace(
    x0 + i * cell + 3,
    x0 + arr.length * cell - 3,
    50 + cell + 40,
    "右端：3 種",
    { color: C.green },
  );
  body += text(
    x0,
    190,
    "arr[1] = 1 是 [L, R] 內最小值的子陣列：L ∈ {0, 1}，R ∈ {1, 2, 3}，",
    { anchor: "start", size: 12 },
  );
  body += text(
    x0,
    210,
    "共 (i − left) × (right − i) = 2 × 3 = 6 個 → 對答案貢獻 1 × 6。",
    { anchor: "start", size: 12, weight: "bold" },
  );
  body += text(
    x0,
    232,
    "left / right 是左右第一個更小元素（一側嚴格、一側非嚴格，避免相等值重複計算）。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(560, 248, body);
}

function removeKDigits(): string {
  const num = "1432219";
  let k = 3;
  const rowH = 32;
  const st: string[] = [];
  let body = text(20, 18, `num = "${num}"，移除 k = 3 位使結果最小`, {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(30, 44, "讀入", { anchor: "start", size: 12, weight: "bold" });
  body += text(90, 44, "彈出（前一位比我大就刪）", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(330, 44, "堆疊", { anchor: "start", size: 12, weight: "bold" });
  body += text(530, 44, "剩餘 k", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  num.split("").forEach((d, i) => {
    const popped: string[] = [];
    while (k > 0 && st.length && at(st, st.length - 1) > d) {
      popped.push(st.pop() as string);
      k--;
    }
    st.push(d);
    const y = 70 + i * rowH;
    if (i % 2 === 0)
      body += rect(20, y - rowH / 2, 580, rowH, {
        fill: C.gray,
        stroke: "none",
      });
    body += text(40, y, d, { mono: true, size: 14, weight: "bold" });
    body += text(
      90,
      y,
      popped.length ? popped.map((p) => `刪 ${p}`).join("、") : "—",
      { anchor: "start", size: 12, fill: popped.length ? C.red : C.line },
    );
    st.forEach((c, j) => {
      body += rect(330 + j * 26, y - 11, 24, 22, {
        fill: j === st.length - 1 ? C.blueSoft : C.paper,
        stroke: C.ink,
        sw: 1,
      });
      body += text(330 + j * 26 + 12, y, c, { mono: true, size: 13 });
    });
    body += text(545, y, k, { mono: true, size: 13 });
  });
  const y = 70 + num.length * rowH;
  body += text(
    20,
    y,
    `結果 "${st.join("")}"：高位越小越好，所以一看到「左邊比我大」就立刻刪左邊（堆疊保持非遞減）。`,
    {
      anchor: "start",
      size: 12,
      weight: "bold",
    },
  );
  return svg(620, y + 16, body);
}

// ---------------------------------------------------------------------------
// Grid graphs
// ---------------------------------------------------------------------------

const ISLAND = ["11000", "11011", "00100", "00011", "10011"];

function islands(): string {
  const R = ISLAND.length;
  const Cc = at(ISLAND, 0).length;
  const comp: number[][] = Array.from({ length: R }, () =>
    new Array<number>(Cc).fill(-1),
  );
  let id = 0;
  const order: number[][] = Array.from({ length: R }, () =>
    new Array<number>(Cc).fill(0),
  );
  let tick = 0;
  const dfs = (r: number, c: number) => {
    if (r < 0 || c < 0 || r >= R || c >= Cc) return;
    if (at(ISLAND, r).charAt(c) !== "1" || at(comp, r)[c] !== -1) return;
    at(comp, r)[c] = id;
    at(order, r)[c] = ++tick;
    dfs(r - 1, c);
    dfs(r + 1, c);
    dfs(r, c - 1);
    dfs(r, c + 1);
  };
  for (let r = 0; r < R; r++)
    for (let c = 0; c < Cc; c++)
      if (at(ISLAND, r).charAt(c) === "1" && at(comp, r)[c] === -1) {
        tick = 0;
        dfs(r, c);
        id++;
      }
  const fills = [
    C.blueSoft,
    C.orangeSoft,
    C.greenSoft,
    C.purpleSoft,
    C.yellowSoft,
  ];
  const cell = 44;
  const x0 = 40;
  const y0 = 30;
  let body = grid(x0, y0, R, Cc, {
    cell,
    fill: (r, c) => {
      const k = at(at(comp, r), c);
      return k >= 0 ? at(fills, k % fills.length) : C.gray;
    },
    label: (r, c) => (at(at(comp, r), c) >= 0 ? at(at(order, r), c) : ""),
    size: 12,
  });
  for (let k = 0; k < id; k++) {
    for (let r = 0; r < R; r++)
      for (let c = 0; c < Cc; c++)
        if (at(at(comp, r), c) === k && at(at(order, r), c) === 1) {
          body += chip(
            x0 + c * cell + cell - 4,
            y0 + r * cell + 6,
            `島 ${k + 1}`,
            { size: 10, fill: C.ink },
          );
        }
  }
  const tx = x0 + Cc * cell + 30;
  body += text(tx, y0 + 16, `共 ${id} 座島嶼`, {
    anchor: "start",
    size: 13,
    weight: "bold",
  });
  body += text(tx, y0 + 44, "格中數字：該島內 DFS 的造訪順序", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, y0 + 66, "（上、下、左、右）。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, y0 + 96, "每遇到一個未造訪的陸地就啟動一次", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, y0 + 118, "DFS，把整座島「淹掉」；啟動次數", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, y0 + 140, "即島嶼數。每格至多訪問一次：O(mn)。", {
    anchor: "start",
    size: 12,
  });
  return svg(560, y0 + R * cell + 16, body);
}

const MAZE = ["S..#....", ".#.#.##.", ".#...#..", ".####.#.", "......#T"];

function gridBfs(): string {
  const R = MAZE.length;
  const Cc = at(MAZE, 0).length;
  const dist: number[][] = Array.from({ length: R }, () =>
    new Array<number>(Cc).fill(-1),
  );
  const q: [number, number][] = [[0, 0]];
  at(dist, 0)[0] = 0;
  const par = new Map<string, [number, number]>();
  for (let h = 0; h < q.length; h++) {
    const [r, c] = at(q, h);
    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= R || nc >= Cc) continue;
      if (at(MAZE, nr).charAt(nc) === "#" || at(at(dist, nr), nc) !== -1)
        continue;
      at(dist, nr)[nc] = at(at(dist, r), c) + 1;
      par.set(`${nr},${nc}`, [r, c]);
      q.push([nr, nc]);
    }
  }
  const onPath = new Set<string>();
  let cur: [number, number] | undefined = [R - 1, Cc - 1];
  while (cur) {
    onPath.add(`${cur[0]},${cur[1]}`);
    cur = par.get(`${cur[0]},${cur[1]}`);
  }
  const maxD = Math.max(...dist.flat());
  const cell = 42;
  const x0 = 30;
  const y0 = 30;
  const shade = (d: number) => {
    const t = d / maxD;
    const light = 94 - t * 38;
    return `hsl(215, 80%, ${light.toFixed(0)}%)`;
  };
  let body = grid(x0, y0, R, Cc, {
    cell,
    fill: (r, c) =>
      at(MAZE, r).charAt(c) === "#"
        ? C.ink
        : at(at(dist, r), c) >= 0
          ? shade(at(at(dist, r), c))
          : C.paper,
    label: (r, c) => (at(MAZE, r).charAt(c) === "#" ? "" : at(at(dist, r), c)),
    color: (r, c) => (onPath.has(`${r},${c}`) ? C.orange : C.ink),
    bold: (r, c) => onPath.has(`${r},${c}`),
  });
  for (const key of onPath) {
    const [r, c] = key.split(",").map(Number) as [number, number];
    body += rect(x0 + c * cell + 3, y0 + r * cell + 3, cell - 6, cell - 6, {
      stroke: C.orange,
      sw: 2,
      rx: 4,
    });
  }
  body += text(x0 + cell / 2, y0 - 10, "S", { weight: "bold", fill: C.green });
  body += text(x0 + (Cc - 1) * cell + cell / 2, y0 + R * cell + 14, "T", {
    weight: "bold",
    fill: C.red,
  });
  body += text(x0 + Cc * cell + 20, y0 + 20, "格中數字 = 從 S 出發的最短步數", {
    anchor: "start",
    size: 12,
  });
  body += text(
    x0 + Cc * cell + 20,
    y0 + 42,
    "顏色越深離 S 越遠；BFS 按層擴張，",
    { anchor: "start", size: 12 },
  );
  body += text(
    x0 + Cc * cell + 20,
    y0 + 64,
    "第一次到達某格時的層數即最短距離。",
    { anchor: "start", size: 12 },
  );
  body += text(
    x0 + Cc * cell + 20,
    y0 + 94,
    `橘框：沿 parent 回溯出的一條最短路（${at(at(dist, R - 1), Cc - 1)} 步）。`,
    {
      anchor: "start",
      size: 12,
      fill: C.orange,
    },
  );
  return svg(640, y0 + R * cell + 26, body);
}

function zeroOneBfs(): string {
  // 0 = free cell (cost 0), 1 = obstacle to remove (cost 1). LC 2290.
  const g = ["01100", "01010", "01110", "00010"];
  const R = g.length;
  const Cc = at(g, 0).length;
  const INF = 1e9;
  const dist: number[][] = Array.from({ length: R }, () =>
    new Array<number>(Cc).fill(INF),
  );
  at(dist, 0)[0] = 0;
  const dq: [number, number][] = [[0, 0]];
  while (dq.length) {
    const [r, c] = dq.shift() as [number, number];
    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= R || nc >= Cc) continue;
      const w = Number(at(g, nr).charAt(nc));
      const nd = at(at(dist, r), c) + w;
      if (nd < at(at(dist, nr), nc)) {
        at(dist, nr)[nc] = nd;
        if (w === 0) dq.unshift([nr, nc]);
        else dq.push([nr, nc]);
      }
    }
  }
  const cell = 44;
  const x0 = 30;
  const y0 = 40;
  let body = panelTitle(x0, 16, "格子（灰 = 障礙，走進去成本 1）");
  body += grid(x0, y0, R, Cc, {
    cell,
    fill: (r, c) => (at(g, r).charAt(c) === "1" ? C.line : C.paper),
    label: (r, c) => at(g, r).charAt(c),
  });
  const x1 = x0 + Cc * cell + 40;
  body += panelTitle(x1, 16, "dist = 最少移除障礙數");
  body += grid(x1, y0, R, Cc, {
    cell,
    fill: (r, c) =>
      [C.greenSoft, C.yellowSoft, C.orangeSoft, C.redSoft][
        Math.min(3, at(at(dist, r), c))
      ],
    label: (r, c) => at(at(dist, r), c),
    bold: (r, c) => r === R - 1 && c === Cc - 1,
  });
  const y1 = y0 + R * cell + 30;
  body += panelTitle(x0, y1, "雙端佇列：邊權 0 → 放隊首；邊權 1 → 放隊尾");
  const dqItems = ["d", "d", "d", "d+1", "d+1"];
  dqItems.forEach((v, i) => {
    body += rect(x0 + i * 50, y1 + 16, 48, 28, {
      fill: v === "d" ? C.greenSoft : C.yellowSoft,
      stroke: C.ink,
      sw: 1,
    });
    body += text(x0 + i * 50 + 24, y1 + 30, v, { mono: true, size: 12 });
  });
  body += line(x0 - 4, y1 + 30, x0 - 36, y1 + 30, {
    arrow: "start",
    stroke: C.green,
    marker: "ah-green",
  });
  body += text(x0 - 20, y1 + 56, "w=0", { size: 11, fill: C.green });
  body += line(x0 + 5 * 50 + 4, y1 + 30, x0 + 5 * 50 + 36, y1 + 30, {
    arrow: "start",
    stroke: C.orange,
    marker: "ah-orange",
  });
  body += text(x0 + 5 * 50 + 22, y1 + 56, "w=1", { size: 11, fill: C.orange });
  body += text(x0 + 330, y1 + 30, "佇列中距離只有 d 與 d+1 兩種，", {
    anchor: "start",
    size: 12,
  });
  body += text(x0 + 330, y1 + 50, "且前段全是 d → 等同 Dijkstra，O(V+E)。", {
    anchor: "start",
    size: 12,
  });
  return svg(660, y1 + 70, body);
}

function rottingOranges(): string {
  const g = ["2110", "1101", "0112", "1011"];
  const R = g.length;
  const Cc = at(g, 0).length;
  const t: number[][] = Array.from({ length: R }, () =>
    new Array<number>(Cc).fill(-1),
  );
  const q: [number, number][] = [];
  for (let r = 0; r < R; r++)
    for (let c = 0; c < Cc; c++)
      if (at(g, r).charAt(c) === "2") {
        at(t, r)[c] = 0;
        q.push([r, c]);
      }
  for (let h = 0; h < q.length; h++) {
    const [r, c] = at(q, h);
    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= R || nc >= Cc) continue;
      if (at(g, nr).charAt(nc) !== "1" || at(at(t, nr), nc) !== -1) continue;
      at(t, nr)[nc] = at(at(t, r), c) + 1;
      q.push([nr, nc]);
    }
  }
  const cell = 46;
  const x0 = 30;
  const y0 = 30;
  const palette = [C.red, "#f59e8b", "#fbc4b4", "#fde0d6", "#fff0ea"];
  let body = grid(x0, y0, R, Cc, {
    cell,
    fill: (r, c) =>
      at(g, r).charAt(c) === "0"
        ? C.gray
        : at(at(t, r), c) >= 0
          ? at(palette, Math.min(4, at(at(t, r), c)))
          : C.greenSoft,
    label: (r, c) =>
      at(g, r).charAt(c) === "0"
        ? ""
        : at(at(t, r), c) >= 0
          ? `t=${at(at(t, r), c)}`
          : "✕",
    color: (r, c) => (at(at(t, r), c) === 0 ? C.paper : C.ink),
    size: 12,
  });
  const maxT = Math.max(...t.flat());
  const unreachable = g.some((row, r) =>
    row.split("").some((ch, c) => ch === "1" && at(at(t, r), c) === -1),
  );
  const tx = x0 + Cc * cell + 24;
  body += text(tx, y0 + 16, "多源 BFS：所有 t=0 的腐爛橘子", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, y0 + 38, "同時入佇列，一層就是一分鐘。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, y0 + 68, `最後被感染的時間 = ${maxT}`, {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  if (unreachable) {
    body += text(tx, y0 + 96, "綠色 ✕：永遠碰不到 → 答案為 −1", {
      anchor: "start",
      size: 12,
      fill: C.green,
    });
  }
  return svg(520, y0 + R * cell + 16, body);
}

export const part1Figures: BookFigure[] = [
  {
    id: "sw-fixed",
    category: "sliding_window",
    section: "1. 基礎",
    caption: "定長滑動視窗：每次右移只做「進一個、出一個」兩次 O(1) 更新",
    render: fixedWindow,
  },
  {
    id: "sw-longest",
    category: "sliding_window",
    section: "4. 越短越合法/求最長/最大",
    caption: "不定長視窗求最長：「無重複字元的最長子字串」(LC 3) 逐步追蹤",
    render: longestNoRepeat,
  },
  {
    id: "sw-shortest",
    category: "sliding_window",
    section: "6. 越長越合法/求最短/最小",
    caption: "不定長視窗求最短：長度最小的子陣列 (LC 209, target = 7)",
    render: minWindowSum,
  },
  {
    id: "sw-count-short",
    category: "sliding_window",
    section: "7. 求子陣列個數 > 越短越合法",
    caption: "越短越合法的計數：以 r 結尾的合法子陣列有 r − l + 1 個 (LC 713)",
    render: countShortValid,
  },
  {
    id: "sw-count-long",
    category: "sliding_window",
    section: "8. 求子陣列個數 > 越長越合法",
    caption: "越長越合法的計數：收縮到恰好不合法之前，左端點有 l 種選法",
    render: countLongValid,
  },
  {
    id: "sw-exactly",
    category: "sliding_window",
    section: "9. 求子陣列個數 > 恰好型滑動視窗",
    caption: "恰好型視窗化成兩個「至少型」視窗之差",
    render: exactlyK,
  },
  {
    id: "sw-two-sum",
    category: "sliding_window",
    section: "12. 相向雙指標",
    caption: "相向雙指標：有序陣列兩數之和 (target = 10)",
    render: twoSumSorted,
  },
  {
    id: "sw-remove",
    category: "sliding_window",
    section: "16. 原地修改",
    caption: "快慢指標原地刪除：slow 左側永遠是「已確定保留」的前綴",
    render: removeInPlace,
  },
  {
    id: "sw-expand",
    category: "sliding_window",
    section: "15. 背向雙指標",
    caption: "背向雙指標：由中心向外擴張找迴文",
    render: expandCenter,
  },
  {
    id: "sw-matrix",
    category: "sliding_window",
    section: "17. 矩陣上的雙指標",
    caption: "列、行皆遞增的矩陣：從右上角出發的階梯搜尋 (LC 240)",
    render: matrixStaircase,
  },
  {
    id: "sw-subseq",
    category: "sliding_window",
    section: "19. 判斷子序列",
    caption: "判斷子序列：t 上的指標只前進，貪心地配對最早出現的字元",
    render: isSubsequence,
  },
  {
    id: "sw-group",
    category: "sliding_window",
    section: "22. 分組迴圈",
    caption: "分組迴圈：把陣列切成極長的嚴格遞增段",
    render: groupLoop,
  },

  {
    id: "bs-end",
    category: "binary_search",
    section: "",
    caption: "閉區間二分結束時的左右指標位置（查詢第一個 ≥ 8）",
    render: bsEndState,
  },
  {
    id: "bs-trace",
    category: "binary_search",
    section: "1. 基礎",
    caption: "閉區間二分的逐輪追蹤：紅色已確認 < target，藍色已確認 ≥ target",
    render: bsTrace,
  },
  {
    id: "bs-conv",
    category: "binary_search",
    section: "2. 進階",
    caption: "四種邊界查詢都化成 lower_bound",
    render: bsConversions,
  },
  {
    id: "bs-min",
    category: "binary_search",
    section: "3. 求最小",
    caption: "二分答案求最小：愛吃香蕉的珂珂 (LC 875)，找第一個 T",
    render: bsAnswerMin,
  },
  {
    id: "bs-max",
    category: "binary_search",
    section: "4. 求最大",
    caption:
      "二分答案求最大：每個小孩最多能分到多少糖果 (LC 2226)，找最後一個 T",
    render: bsAnswerMax,
  },
  {
    id: "bs-minmax",
    category: "binary_search",
    section: "6. 最小化最大值",
    caption: "最小化最大值：分割陣列 (LC 410) 的 check 函數",
    render: bsMinMax,
  },
  {
    id: "bs-maxmin",
    category: "binary_search",
    section: "7. 最大化最小值",
    caption: "最大化最小值：兩球之間的磁力 (LC 1552) 的貪心檢查",
    render: bsMaxMin,
  },
  {
    id: "bs-kth",
    category: "binary_search",
    section: "8. 第 K 小/大",
    caption: "值域二分找第 K 小：有序矩陣的階梯計數 (LC 378, k = 8)",
    render: bsKthMatrix,
  },
  {
    id: "bs-ternary",
    category: "binary_search",
    section: "9. 三分法",
    caption: "三分法：比較 f(m1) 與 f(m2)，每輪丟掉三分之一",
    render: ternary,
  },

  {
    id: "ms-daily",
    category: "monotonic_stack",
    section: "1. 基礎",
    caption: "每日溫度 (LC 739)：單調堆疊的逐步狀態",
    render: dailyTemperatures,
  },
  {
    id: "ms-arcs",
    category: "monotonic_stack",
    section: "2. 進階",
    caption: "「下一個更大元素」關係畫成弧線：弧互不交叉，所以能用堆疊維護",
    render: nextGreaterArcs,
  },
  {
    id: "ms-hist",
    category: "monotonic_stack",
    section: "3. 矩形",
    caption: "柱狀圖中最大的矩形 (LC 84)：每根柱子向兩側延伸到第一根更矮的柱子",
    render: histogram,
  },
  {
    id: "ms-contrib",
    category: "monotonic_stack",
    section: "4. 貢獻法",
    caption: "貢獻法：計算一個元素是多少個子陣列的最小值 (LC 907)",
    render: contribution,
  },
  {
    id: "ms-lex",
    category: "monotonic_stack",
    section: "5. 最小字典序",
    caption: "移掉 K 位數字 (LC 402)：以單調堆疊貪心地讓高位變小",
    render: removeKDigits,
  },

  {
    id: "grid-dfs",
    category: "grid",
    section: "1. 網格圖 DFS",
    caption: "網格圖 DFS：島嶼數量 (LC 200)，每次 DFS 淹掉一整座島",
    render: islands,
  },
  {
    id: "grid-bfs",
    category: "grid",
    section: "2. 網格圖 BFS",
    caption: "網格圖 BFS：距離按層遞增，第一次抵達即最短",
    render: gridBfs,
  },
  {
    id: "grid-01",
    category: "grid",
    section: "3. 0-1 BFS",
    caption: "0-1 BFS：移除障礙物的最少數目 (LC 2290)",
    render: zeroOneBfs,
  },
  {
    id: "grid-multi",
    category: "grid",
    section: "4. 綜合應用",
    caption: "多源 BFS：腐爛的橘子 (LC 994)",
    render: rottingOranges,
  },
];
