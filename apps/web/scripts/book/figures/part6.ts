/**
 * Figures for linked lists / trees / backtracking, strings and sorting.
 */
import type { BookFigure } from "./types";
import {
  C,
  array,
  brace,
  circle,
  drawTree,
  grid,
  gridHeaders,
  layoutTree,
  line,
  panelTitle,
  path,
  pointer,
  rect,
  svg,
  text,
  type TreeNode,
} from "./svg";

const at = <T>(a: readonly T[], i: number): T => a[i] as T;

// ---------------------------------------------------------------------------
// Linked lists
// ---------------------------------------------------------------------------

function listRow(
  x0: number,
  y: number,
  vals: (string | number)[],
  o: {
    fill?: (i: number) => string | undefined;
    gap?: number;
    arrows?: (i: number) => "right" | "left" | "none" | "skip";
    arrowColor?: (i: number) => string;
  } = {},
): string {
  const w = 40;
  const gap = o.gap ?? 26;
  let body = "";
  vals.forEach((v, i) => {
    const x = x0 + i * (w + gap);
    body += rect(x, y, w, 30, {
      fill: o.fill?.(i) ?? C.paper,
      stroke: C.ink,
      rx: 4,
    });
    body += text(x + w / 2, y + 15, v, {
      mono: true,
      size: String(v).length > 3 ? 9.5 : 13,
    });
    if (i < vals.length - 1) {
      const kind = o.arrows?.(i) ?? "right";
      const color = o.arrowColor?.(i) ?? C.ink;
      const marker =
        color === C.orange
          ? "ah-orange"
          : color === C.red
            ? "ah-red"
            : color === C.green
              ? "ah-green"
              : color === C.blue
                ? "ah-blue"
                : "ah";
      if (kind === "right")
        body += line(x + w, y + 15, x + w + gap - 2, y + 15, {
          stroke: color,
          arrow: "end",
          marker,
          sw: 1.5,
        });
      if (kind === "left")
        body += line(x + w + gap, y + 15, x + w + 2, y + 15, {
          stroke: color,
          arrow: "end",
          marker,
          sw: 1.5,
        });
      if (kind === "skip")
        body += path(
          `M${x + w},${y + 8} Q${x + w + gap + w / 2},${y - 26} ${x + 2 * w + 2 * gap - 2},${y + 8}`,
          { stroke: color, arrow: "end", marker, sw: 1.8 },
        );
    }
  });
  return body;
}

function deleteNode(): string {
  const vals = ["dummy", 1, 6, 2, 6, 3];
  let body = panelTitle(
    20,
    20,
    "刪除所有值為 6 的節點：從 dummy 出發，永遠「看下一個」",
  );
  body += listRow(40, 60, vals, {
    fill: (i) =>
      i === 0 ? C.gray : at(vals, i) === 6 ? C.redSoft : C.blueSoft,
    arrows: (i) =>
      at(vals, i + 1) === 6 ? "skip" : at(vals, i) === 6 ? "none" : "right",
    arrowColor: (i) => (at(vals, i + 1) === 6 ? C.orange : C.ink),
  });
  const w = 66;
  body += text(40 + 2 * w + 20, 108, "cur.next = cur.next.next", {
    size: 11,
    mono: true,
    fill: C.orange,
  });
  body += text(
    40,
    150,
    "當 cur.next 要被刪除時，改接到下下個節點；否則 cur 前進。dummy（哨兵）讓「刪除頭節點」不必特判。",
    { anchor: "start", size: 12 },
  );
  return svg(640, 166, body);
}

function reverseList(): string {
  const vals = [1, 2, 3, 4];
  let body = "";
  const steps = 3;
  for (let s = 0; s < steps; s++) {
    const y = 40 + s * 76;
    body += text(20, y + 15, `第 ${s + 1} 輪後`, { anchor: "start", size: 12 });
    body += listRow(110, y, vals, {
      fill: (i) => (i <= s ? C.greenSoft : C.paper),
      arrows: (i) => (i < s ? "left" : i === s ? "none" : "right"),
      arrowColor: (i) => (i < s ? C.green : C.ink),
    });
    const X = (i: number) => 110 + i * 66 + 20;
    body += pointer(X(s), y + 30, "pre", {
      below: true,
      color: C.green,
      len: 10,
      size: 11,
    });
    if (s + 1 < vals.length)
      body += pointer(X(s + 1), y + 30, "cur", {
        below: true,
        color: C.orange,
        len: 10,
        size: 11,
      });
  }
  body += text(
    20,
    40 + steps * 76 - 6,
    "每輪：nxt = cur.next；cur.next = pre；pre = cur；cur = nxt。綠色是已反轉的前綴，pre 指向它的新頭。",
    { anchor: "start", size: 12 },
  );
  return svg(640, 40 + steps * 76 + 10, body);
}

function floydCycle(): string {
  const cx = 420;
  const cy = 120;
  const R = 80;
  let body = "";
  const tail = [60, 150, 240];
  tail.forEach((x, i) => {
    body += circle(x, cy, 14, { fill: C.blueSoft });
    if (i < tail.length - 1)
      body += line(x + 14, cy, at(tail, i + 1) - 16, cy, { arrow: "end" });
  });
  body += line(254, cy, cx - R - 16, cy, { arrow: "end" });
  body += circle(cx, cy, R, { fill: "none", stroke: C.ink, sw: 1.4 });
  const entry: [number, number] = [cx - R, cy];
  const meetAng = (-40 * Math.PI) / 180;
  const meet: [number, number] = [
    cx + R * Math.cos(Math.PI + meetAng * -1 - Math.PI),
    cy + R * Math.sin(meetAng),
  ];
  body += circle(entry[0], entry[1], 9, {
    fill: C.orangeSoft,
    stroke: C.orange,
  });
  body += text(entry[0] - 4, entry[1] + 26, "入環點", {
    size: 11,
    fill: C.orange,
    weight: "bold",
  });
  const mx = cx + R * Math.cos((-50 * Math.PI) / 180);
  const my = cy + R * Math.sin((-50 * Math.PI) / 180);
  void meet;
  body += circle(mx, my, 9, { fill: C.greenSoft, stroke: C.green });
  body += text(mx + 14, my - 10, "相遇點", {
    anchor: "start",
    size: 11,
    fill: C.green,
    weight: "bold",
  });
  body += brace(60, cx - R, cy + 30, "a", { size: 13 });
  body += text(cx - 30, cy - R - 10, "b", {
    size: 13,
    weight: "bold",
    fill: C.blue,
  });
  body += text(cx + 50, cy + R + 4, "c", {
    size: 13,
    weight: "bold",
    fill: C.purple,
  });
  body += path(
    `M${entry[0]},${entry[1] - 12} A${R - 12},${R - 12} 0 0 1 ${mx - 8},${my + 8}`,
    { stroke: C.blue, sw: 2.4 },
  );
  body += path(
    `M${mx + 6},${my + 12} A${R - 12},${R - 12} 0 1 1 ${entry[0] + 12},${entry[1] + 4}`,
    { stroke: C.purple, sw: 2.4, dash: "5 3" },
  );
  body += text(
    20,
    240,
    "慢指標走 a + b，快指標走 a + b + k(b + c)，且快 = 2 × 慢 ⇒ a = (k−1)(b+c) + c。",
    { anchor: "start", size: 12, mono: false },
  );
  body += text(
    20,
    262,
    "所以相遇後，一個指標回到頭、兩者每次各走一步，會恰好在入環點相遇。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(560, 278, body);
}

function nthFromEnd(): string {
  const vals = ["dummy", 1, 2, 3, 4, 5];
  const n = 2;
  let body = panelTitle(
    20,
    20,
    `刪除倒數第 ${n} 個節點：前後指標保持 ${n} 格距離`,
  );
  body += listRow(40, 70, vals, {
    fill: (i) =>
      i === vals.length - n ? C.redSoft : i === 0 ? C.gray : C.blueSoft,
  });
  const X = (i: number) => 40 + i * 66 + 20;
  body += pointer(X(vals.length - n - 1), 100, "left", {
    below: true,
    color: C.green,
    len: 12,
    size: 11,
  });
  body += pointer(X(vals.length - 1), 100, "right", {
    below: true,
    color: C.orange,
    len: 12,
    size: 11,
  });
  body += brace(X(vals.length - n - 1), X(vals.length - 1), 60, `相距 ${n}`, {
    above: true,
    color: C.orange,
  });
  body += text(
    40,
    170,
    "right 先走 n 步，然後兩者同步前進；right 到達最後一個節點時，left.next 就是要刪的節點。一次遍歷。",
    { anchor: "start", size: 12 },
  );
  return svg(640, 186, body);
}

function mergeLists(): string {
  const a = [1, 4, 7];
  const b = [2, 3, 8];
  let body = text(20, 45, "l1", {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.blue,
  });
  body += listRow(60, 30, a, { fill: () => C.blueSoft });
  body += text(20, 105, "l2", {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.orange,
  });
  body += listRow(60, 90, b, { fill: () => C.orangeSoft });
  const merged = [...a, ...b].sort((x, y) => x - y);
  body += text(20, 185, "結果", { anchor: "start", size: 12 });
  body += listRow(60, 170, ["dummy", ...merged], {
    fill: (i) =>
      i === 0
        ? C.gray
        : a.includes(at(merged, i - 1))
          ? C.blueSoft
          : C.orangeSoft,
  });
  body += text(
    20,
    240,
    "比較兩串的頭，較小者接到結果尾巴並前進；一串用完就把另一串整段接上。O(n + m)，不需額外節點。",
    { anchor: "start", size: 12 },
  );
  return svg(640, 256, body);
}

// ---------------------------------------------------------------------------
// Binary trees
// ---------------------------------------------------------------------------

interface BT {
  v: number;
  l?: BT;
  r?: BT;
}
const BT1: BT = {
  v: 1,
  l: { v: 2, l: { v: 4 }, r: { v: 5, l: { v: 7 } } },
  r: { v: 3, r: { v: 6 } },
};

function toTree(
  t: BT | undefined,
  decorate: (t: BT) => Partial<TreeNode>,
): TreeNode | null {
  if (!t) return null;
  const kids = t.l || t.r ? [toTree(t.l, decorate), toTree(t.r, decorate)] : [];
  return { label: t.v, ...decorate(t), children: kids };
}

function traversals(): string {
  const pre: number[] = [];
  const ino: number[] = [];
  const post: number[] = [];
  const walk = (t?: BT) => {
    if (!t) return;
    pre.push(t.v);
    walk(t.l);
    ino.push(t.v);
    walk(t.r);
    post.push(t.v);
  };
  walk(BT1);
  const root = toTree(BT1, (t) => ({
    note: `${pre.indexOf(t.v) + 1}/${ino.indexOf(t.v) + 1}/${post.indexOf(t.v) + 1}`,
    fill: C.blueSoft,
  }))!;
  const placed = layoutTree(root, 56, 64, 40, 30);
  let body = drawTree(placed);
  const tx = 330;
  body += text(tx, 40, "節點下方：先序 / 中序 / 後序 的名次", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 74, `先序（根左右）：${pre.join(" ")}`, {
    anchor: "start",
    size: 13,
    mono: true,
    fill: C.blue,
  });
  body += text(tx, 100, `中序（左根右）：${ino.join(" ")}`, {
    anchor: "start",
    size: 13,
    mono: true,
    fill: C.green,
  });
  body += text(tx, 126, `後序（左右根）：${post.join(" ")}`, {
    anchor: "start",
    size: 13,
    mono: true,
    fill: C.orange,
  });
  body += text(tx, 160, "三者走的是同一條 DFS 路線，差別只在", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 182, "「何時處理根」：進入時、左右之間、離開時。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(660, 290, body);
}

function topDown(): string {
  const target = 10;
  const T: BT = {
    v: 5,
    l: { v: 4, l: { v: 1 }, r: { v: 2 } },
    r: { v: 3, l: { v: 2 }, r: { v: 7 } },
  };
  const sums = new Map<BT, number>();
  const walk = (t: BT | undefined, s: number) => {
    if (!t) return;
    sums.set(t, s + t.v);
    walk(t.l, s + t.v);
    walk(t.r, s + t.v);
  };
  walk(T, 0);
  const root = toTree(T, (t) => {
    const s = sums.get(t) ?? 0;
    const leaf = !t.l && !t.r;
    return {
      note: `sum=${s}`,
      fill: leaf && s === target ? C.greenSoft : C.blueSoft,
      noteColor: leaf && s === target ? C.green : C.muted,
    };
  })!;
  let body = drawTree(layoutTree(root, 62, 66, 40, 30));
  const tx = 330;
  body += text(tx, 40, `路徑總和 = ${target}？（LC 112）`, {
    anchor: "start",
    size: 13,
    weight: "bold",
  });
  body += text(tx, 68, "自頂向下：把「從根到這裡的和」當參數", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 90, "傳給子節點（遞）。", { anchor: "start", size: 12 });
  body += text(tx, 120, "到葉子時檢查 sum == target（綠）。", {
    anchor: "start",
    size: 12,
    fill: C.green,
  });
  body += text(tx, 150, "dfs(node, sum + node.val)", {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.blue,
  });
  body += text(tx, 180, "適合：答案取決於「祖先」的資訊，", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 202, "例如深度、路徑和、路徑上的最大值。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(640, 260, body);
}

function bottomUp(): string {
  const h = new Map<BT, number>();
  const walk = (t?: BT): number => {
    if (!t) return 0;
    const v = Math.max(walk(t.l), walk(t.r)) + 1;
    h.set(t, v);
    return v;
  };
  walk(BT1);
  const root = toTree(BT1, (t) => ({
    note: `回傳 ${h.get(t)}`,
    fill: C.orangeSoft,
    noteColor: C.orange,
  }))!;
  let body = drawTree(layoutTree(root, 56, 66, 40, 30));
  const tx = 330;
  body += text(tx, 40, "最大深度（LC 104）", {
    anchor: "start",
    size: 13,
    weight: "bold",
  });
  body += text(tx, 68, "自底向上：先遞迴拿到左右子樹的答案，", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 90, "再在「歸」的時候合併（後序位置）。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 120, "depth(t) = max(depth(l), depth(r)) + 1", {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.orange,
  });
  body += text(tx, 150, "空節點回傳 0 是遞迴的邊界。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 180, "適合：答案取決於「子樹」的資訊，", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 202, "例如高度、節點數、子樹是否平衡。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(660, 290, body);
}

function lcaFigure(): string {
  const p = 7;
  const q = 4;
  const path = (
    t: BT | undefined,
    x: number,
    acc: number[],
  ): number[] | null => {
    if (!t) return null;
    const next = [...acc, t.v];
    if (t.v === x) return next;
    return path(t.l, x, next) ?? path(t.r, x, next);
  };
  const pp = path(BT1, p, [])!;
  const qp = path(BT1, q, [])!;
  let lca = 1;
  for (let i = 0; i < Math.min(pp.length, qp.length); i++)
    if (pp[i] === qp[i]) lca = at(pp, i);
  const root = toTree(BT1, (t) => ({
    fill:
      t.v === lca
        ? C.greenSoft
        : t.v === p || t.v === q
          ? C.orangeSoft
          : pp.includes(t.v) || qp.includes(t.v)
            ? C.yellowSoft
            : C.paper,
    note: t.v === lca ? "LCA" : undefined,
    noteColor: C.green,
  }))!;
  let body = drawTree(layoutTree(root, 56, 66, 40, 30));
  const tx = 330;
  body += text(tx, 40, `p = ${p}、q = ${q} 的最近公共祖先 = ${lca}`, {
    anchor: "start",
    size: 13,
    weight: "bold",
  });
  body += text(tx, 70, "遞迴回傳「子樹中找到的 p 或 q」：", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 92, "・遇到 p 或 q 直接回傳自己", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 114, "・左右都非空 → 自己就是 LCA", {
    anchor: "start",
    size: 12,
    fill: C.green,
  });
  body += text(tx, 136, "・只有一邊非空 → 往上傳那一邊", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 166, "黃色是 p、q 到根的路徑，", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 188, "兩條路徑分岔的位置就是 LCA。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(660, 290, body);
}

function bstRanges(): string {
  const T: BT = {
    v: 8,
    l: { v: 3, l: { v: 1 }, r: { v: 6, l: { v: 4 }, r: { v: 7 } } },
    r: { v: 10, r: { v: 14, l: { v: 13 } } },
  };
  const range = new Map<BT, [string, string]>();
  const walk = (t: BT | undefined, lo: string, hi: string) => {
    if (!t) return;
    range.set(t, [lo, hi]);
    walk(t.l, lo, String(t.v));
    walk(t.r, String(t.v), hi);
  };
  walk(T, "−∞", "+∞");
  const root = toTree(T, (t) => {
    const [lo, hi] = range.get(t)!;
    return { note: `(${lo}, ${hi})`, fill: C.blueSoft };
  })!;
  let body = drawTree(layoutTree(root, 60, 66, 40, 30));
  const ino: number[] = [];
  const walk2 = (t?: BT) => {
    if (!t) return;
    walk2(t.l);
    ino.push(t.v);
    walk2(t.r);
  };
  walk2(T);
  const tx = 360;
  body += text(tx, 40, "二叉搜尋樹：左子樹 < 根 < 右子樹", {
    anchor: "start",
    size: 13,
    weight: "bold",
  });
  body += text(tx, 68, "節點下方是它允許的開區間：往左走", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 90, "更新上界、往右走更新下界。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 120, "中序遍歷一定遞增：", { anchor: "start", size: 12 });
  body += text(tx, 142, ino.join(" < "), {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.green,
  });
  body += text(tx, 172, "驗證 BST：只比較父子是不夠的，", {
    anchor: "start",
    size: 12,
    fill: C.red,
  });
  body += text(tx, 194, "要檢查整條祖先鏈給的上下界。", {
    anchor: "start",
    size: 12,
    fill: C.red,
  });
  return svg(660, 300, body);
}

function buildFromOrders(): string {
  const pre = [3, 9, 20, 15, 7];
  const ino = [9, 3, 15, 20, 7];
  const cell = 40;
  let body = text(20, 45, "先序", { anchor: "start", size: 12 });
  body += array(70, 30, pre, {
    cell,
    h: 32,
    fill: (i) => (i === 0 ? C.orangeSoft : i === 1 ? C.blueSoft : C.greenSoft),
  });
  body += text(20, 105, "中序", { anchor: "start", size: 12 });
  body += array(70, 90, ino, {
    cell,
    h: 32,
    fill: (i) => (i === 1 ? C.orangeSoft : i < 1 ? C.blueSoft : C.greenSoft),
  });
  body += line(70 + cell / 2, 62, 70 + cell + cell / 2, 88, {
    stroke: C.orange,
    arrow: "end",
    marker: "ah-orange",
  });
  body += brace(72, 70 + cell - 2, 126, "左子樹", { color: C.blue, size: 11 });
  body += brace(70 + 2 * cell + 2, 70 + 5 * cell - 2, 126, "右子樹", {
    color: C.green,
    size: 11,
  });
  const T: BT = { v: 3, l: { v: 9 }, r: { v: 20, l: { v: 15 }, r: { v: 7 } } };
  const root = toTree(T, (t) => ({
    fill: t.v === 3 ? C.orangeSoft : t.v === 9 ? C.blueSoft : C.greenSoft,
  }))!;
  body += drawTree(layoutTree(root, 50, 60, 330, 40));
  body += text(
    20,
    200,
    "先序第一個是根；在中序中找到根（橘），左邊是左子樹、右邊是右子樹，",
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    220,
    "兩段的長度也決定了先序該怎麼切。遞迴建構；用雜湊表存中序位置，總計 O(n)。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(560, 236, body);
}

function levelOrder(): string {
  const levels: number[][] = [];
  const q: [BT, number][] = [[BT1, 0]];
  for (let h = 0; h < q.length; h++) {
    const [t, d] = at(q, h);
    (levels[d] ??= []).push(t.v);
    if (t.l) q.push([t.l, d + 1]);
    if (t.r) q.push([t.r, d + 1]);
  }
  const fills = [C.orangeSoft, C.blueSoft, C.greenSoft, C.purpleSoft];
  const depthOf = new Map<number, number>();
  levels.forEach((L, d) => L.forEach((v) => depthOf.set(v, d)));
  const root = toTree(BT1, (t) => ({
    fill: at(fills, depthOf.get(t.v) ?? 0),
  }))!;
  const placed = layoutTree(root, 56, 64, 100, 30);
  let body = "";
  levels.forEach((_, d) => {
    body += rect(20, 30 + d * 64 - 22, 280, 44, {
      fill: at(fills, d),
      stroke: "none",
      rx: 8,
      opacity: 0.35,
    });
    body += text(30, 30 + d * 64, `第 ${d} 層`, {
      anchor: "start",
      size: 11,
      fill: C.muted,
    });
  });
  body += drawTree(placed);
  const tx = 330;
  body += text(tx, 40, "BFS 層序遍歷（LC 102）", {
    anchor: "start",
    size: 13,
    weight: "bold",
  });
  levels.forEach(
    (L, d) =>
      (body += text(tx, 70 + d * 24, `第 ${d} 層：[${L.join(", ")}]`, {
        anchor: "start",
        size: 12,
        mono: true,
      })),
  );
  body += text(tx, 80 + levels.length * 24, "每輪先記下佇列長度 k，", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 102 + levels.length * 24, "恰好彈出 k 個 = 處理完一整層。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(640, 290, body);
}

interface GT {
  v: number;
  c: GT[];
}
const GT1: GT = {
  v: 0,
  c: [
    {
      v: 1,
      c: [
        { v: 4, c: [] },
        { v: 5, c: [] },
      ],
    },
    { v: 2, c: [] },
    {
      v: 3,
      c: [
        { v: 6, c: [{ v: 8, c: [] }] },
        { v: 7, c: [] },
      ],
    },
  ],
};

function eulerTour(): string {
  const tin = new Map<number, number>();
  const tout = new Map<number, number>();
  let clock = 0;
  const order: number[] = [];
  const dfs = (t: GT) => {
    tin.set(t.v, clock++);
    order.push(t.v);
    t.c.forEach(dfs);
    tout.set(t.v, clock - 1);
  };
  dfs(GT1);
  const sub = 3;
  const inSub = (v: number) =>
    (tin.get(v) ?? 0) >= (tin.get(sub) ?? 0) &&
    (tin.get(v) ?? 0) <= (tout.get(sub) ?? 0);
  const conv = (t: GT): TreeNode => ({
    label: t.v,
    fill: inSub(t.v) ? C.orangeSoft : C.blueSoft,
    note: `[${tin.get(t.v)}, ${tout.get(t.v)}]`,
    children: t.c.map(conv),
  });
  let body = drawTree(layoutTree(conv(GT1), 56, 66, 40, 30));
  const cell = 36;
  const x0 = 60;
  const y = 320;
  body += text(x0 - 10, y + 16, "DFS 序", { anchor: "end", size: 11 });
  body += array(x0, y, order, {
    cell,
    h: 32,
    showIndex: true,
    fill: (i) => (inSub(at(order, i)) ? C.orangeSoft : C.blueSoft),
  });
  body += brace(
    x0 + (tin.get(sub) ?? 0) * cell + 2,
    x0 + ((tout.get(sub) ?? 0) + 1) * cell - 2,
    y,
    `子樹 ${sub}`,
    { above: true, color: C.orange },
  );
  const tx = 400;
  body += text(tx, 40, "節點下方 [tin, tout]：進入時間與", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 62, "子樹中最大的進入時間。", { anchor: "start", size: 12 });
  body += text(tx, 92, "子樹 ⇔ DFS 序上的連續區間：", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(tx, 114, "v 在 u 的子樹中 ⇔", { anchor: "start", size: 12 });
  body += text(tx, 136, "tin[u] ≤ tin[v] ≤ tout[u]", {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.orange,
  });
  body += text(tx, 166, "子樹修改／查詢 → 區間修改／查詢，", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 188, "交給樹狀陣列或線段樹。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(660, y + 60, body);
}

function binaryLifting(): string {
  const parent = [-1, 0, 1, 2, 3, 4, 5, 6, 7];
  const n = parent.length;
  const x0 = 60;
  const gap = 62;
  let body = "";
  for (let i = 0; i < n; i++) {
    body += circle(x0 + i * gap, 150, 16, {
      fill: i === 8 ? C.orangeSoft : C.blueSoft,
    });
    body += text(x0 + i * gap, 151, i, { mono: true, size: 13 });
    if (i > 0)
      body += line(x0 + i * gap - 16, 150, x0 + (i - 1) * gap + 18, 150, {
        arrow: "end",
        sw: 1.2,
      });
  }
  const colors = [C.green, C.blue, C.purple, C.orange];
  [0, 1, 2, 3].forEach((k) => {
    const d = 1 << k;
    const from = 8;
    const to = from - d;
    if (to < 0) return;
    const x1 = x0 + from * gap;
    const x2 = x0 + to * gap;
    const marker =
      colors[k] === C.green
        ? "ah-green"
        : colors[k] === C.blue
          ? "ah-blue"
          : colors[k] === C.purple
            ? "ah-purple"
            : "ah-orange";
    body += path(`M${x1},134 Q${(x1 + x2) / 2},${110 - k * 26} ${x2 + 4},134`, {
      stroke: at(colors, k),
      sw: 1.8,
      arrow: "end",
      marker: marker as "ah-green",
    });
    body += text(20 + k * 150, 24, `pa[${k}][8] = ${to}（跳 ${d}）`, {
      anchor: "start",
      size: 11,
      fill: at(colors, k),
      weight: "bold",
    });
  });
  body += text(
    20,
    200,
    "pa[k][v] = v 往上跳 2^k 步的祖先，pa[k][v] = pa[k−1][ pa[k−1][v] ]。",
    { anchor: "start", size: 12, mono: false },
  );
  body += text(
    20,
    222,
    "往上跳 d 步：把 d 拆成二進位，例如 d = 6 = 4 + 2 → 先跳 pa[2]、再跳 pa[1]。O(log n)。",
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    244,
    "求 LCA：先把較深的點跳到同一深度，再從大到小嘗試讓兩點一起跳（跳完仍不相同才跳）。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 260, body);
}

function leafPeeling(): string {
  const n = 9;
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [1, 4],
    [4, 5],
    [4, 6],
    [2, 7],
    [7, 8],
  ];
  const deg = new Array<number>(n).fill(0);
  const g: number[][] = Array.from({ length: n }, () => []);
  edges.forEach(([a, b]) => {
    deg[a] = at(deg, a) + 1;
    deg[b] = at(deg, b) + 1;
    at(g, a).push(b);
    at(g, b).push(a);
  });
  const round = new Array<number>(n).fill(-1);
  let cur: number[] = [];
  deg.forEach((d, i) => d <= 1 && cur.push(i));
  let r = 0;
  let left = n;
  while (left > 2 && cur.length) {
    const next: number[] = [];
    for (const u of cur) {
      round[u] = r;
      left--;
      for (const v of at(g, u)) {
        deg[v] = at(deg, v) - 1;
        if (at(deg, v) === 1) next.push(v);
      }
    }
    cur = next;
    r++;
  }
  cur.forEach((u) => (round[u] = r));
  const pos: [number, number][] = [
    [60, 60],
    [170, 120],
    [300, 120],
    [410, 60],
    [170, 220],
    [80, 270],
    [250, 270],
    [410, 180],
    [520, 220],
  ];
  const fills = [C.gray, C.blueSoft, C.orangeSoft, C.greenSoft];
  let body = "";
  edges.forEach(
    ([a, b]) =>
      (body += line(
        at(pos, a)[0],
        at(pos, a)[1],
        at(pos, b)[0],
        at(pos, b)[1],
        { sw: 1.4 },
      )),
  );
  pos.forEach(([x, y], i) => {
    body += circle(x, y, 17, {
      fill: at(fills, Math.min(3, at(round, i))),
      stroke: at(round, i) === r ? C.green : C.ink,
      sw: at(round, i) === r ? 2.6 : 1.4,
    });
    body += text(x, y + 1, i, { mono: true, size: 13 });
    body += text(x, y - 26, `第 ${at(round, i) + 1} 輪`, {
      size: 10,
      fill: C.muted,
    });
  });
  body += text(
    20,
    320,
    "從所有葉子開始一層層剝掉（類似拓撲排序）；最後剩下的 1～2 個點（綠框）就是樹的中心，",
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    340,
    "以它為根樹高最小（LC 310）。剝的輪數也等於「離最近葉子的距離」。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 356, body);
}

// ---------------------------------------------------------------------------
// Backtracking
// ---------------------------------------------------------------------------

function subsetTree(): string {
  const nums = [1, 2, 3];
  const build = (i: number, cur: number[]): TreeNode => {
    if (i === nums.length)
      return {
        label: "",
        note: `{${cur.join(",")}}`,
        fill: C.greenSoft,
        noteColor: C.green,
      };
    return {
      label: `i=${i}`,
      fill: C.blueSoft,
      children: [
        {
          ...build(i + 1, [...cur, at(nums, i)]),
          edgeLabel: `選 ${at(nums, i)}`,
          edgeColor: C.blue,
        },
        { ...build(i + 1, cur), edgeLabel: "不選", edgeColor: C.line },
      ],
    };
  };
  const placed = layoutTree(build(0, []), 72, 70, 40, 30);
  let body = drawTree(placed, { r: 16, size: 10 });
  body += text(
    20,
    330,
    "子集型回溯：每個元素「選 / 不選」兩條分支，葉子（綠）就是 2³ = 8 個子集。",
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    350,
    "另一種寫法：每個節點都是答案，枚舉「下一個選誰」（只往後選避免重複）。兩者都是 O(n·2ⁿ)。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 366, body);
}

function combTree(): string {
  const n = 4;
  const k = 2;
  const build = (start: number, cur: number[]): TreeNode => {
    if (cur.length === k)
      return { label: `${cur.join("")}`, fill: C.greenSoft };
    const kids: TreeNode[] = [];
    for (let x = start; x <= n; x++) {
      const pruned = n - x + 1 < k - cur.length;
      if (pruned)
        kids.push({
          label: x,
          fill: C.redSoft,
          stroke: C.red,
          dashed: true,
          note: "剪枝",
          noteColor: C.red,
        });
      else kids.push({ ...build(x + 1, [...cur, x]), edgeLabel: String(x) });
    }
    return {
      label: cur.length ? cur.join("") : "·",
      fill: C.blueSoft,
      children: kids,
    };
  };
  const placed = layoutTree(build(1, []), 56, 70, 40, 30);
  let body = drawTree(placed, { r: 16, size: 12 });
  body += text(
    20,
    260,
    `組合型回溯：C(${n}, ${k})。下一個數只從 start 往後選 → 不會出現 {2,1} 這種重複。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    280,
    "剪枝：剩下的數不夠湊滿 k 個時（紅）直接不進入。邊上的數字是這一步選的數。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 296, body);
}

function permTree(): string {
  const nums = [1, 2, 3];
  const build = (cur: number[]): TreeNode => {
    if (cur.length === nums.length)
      return { label: cur.join(""), fill: C.greenSoft };
    return {
      label: cur.length ? cur.join("") : "·",
      fill: C.blueSoft,
      children: nums
        .filter((x) => !cur.includes(x))
        .map((x) => ({ ...build([...cur, x]), edgeLabel: String(x) })),
    };
  };
  const placed = layoutTree(build([]), 60, 70, 40, 30);
  let body = drawTree(placed, { r: 17, size: 12 });
  body += text(
    20,
    296,
    "排列型回溯：每層從「還沒用過」的數中選一個（用 used 陣列或交換法），葉子是 3! = 6 個排列。",
    { anchor: "start", size: 12 },
  );
  body += text(20, 316, "節點數約 e·n!，每個葉子輸出 O(n) → 總計 O(n·n!)。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(640, 332, body);
}

function partitionTree(): string {
  const s = "aab";
  const isPal = (t: string) => t === t.split("").reverse().join("");
  const build = (i: number, parts: string[]): TreeNode => {
    if (i === s.length)
      return {
        label: "✓",
        fill: C.greenSoft,
        note: parts.join("|"),
        noteColor: C.green,
      };
    const kids: TreeNode[] = [];
    for (let j = i + 1; j <= s.length; j++) {
      const piece = s.slice(i, j);
      if (isPal(piece))
        kids.push({
          ...build(j, [...parts, piece]),
          edgeLabel: piece,
          edgeColor: C.blue,
        });
      else
        kids.push({
          label: "✗",
          fill: C.redSoft,
          stroke: C.red,
          edgeLabel: piece,
          edgeColor: C.red,
          dashed: true,
        });
    }
    return { label: `i=${i}`, fill: C.blueSoft, children: kids };
  };
  const placed = layoutTree(build(0, []), 64, 70, 40, 30);
  let body = drawTree(placed, { r: 17, size: 11 });
  body += text(
    20,
    330,
    `劃分型回溯（LC 131，s = "${s}"）：節點 i 表示前 i 個字元已切好；邊上是下一段 s[i..j)。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    350,
    "不是迴文的段（紅）立即剪掉；走到 i = n 就得到一種切法（綠，下方為切法）。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 366, body);
}

function dupSkip(): string {
  const nums = [1, 2, 2];
  const build = (start: number, cur: number[]): TreeNode => {
    const kids: TreeNode[] = [];
    for (let i = start; i < nums.length; i++) {
      if (i > start && at(nums, i) === at(nums, i - 1)) {
        kids.push({
          label: at(nums, i),
          fill: C.redSoft,
          stroke: C.red,
          dashed: true,
          edgeLabel: "跳過",
          edgeColor: C.red,
        });
        continue;
      }
      kids.push({
        ...build(i + 1, [...cur, at(nums, i)]),
        edgeLabel: `${at(nums, i)}`,
      });
    }
    return { label: `{${cur.join(",")}}`, fill: C.greenSoft, children: kids };
  };
  const placed = layoutTree(build(0, []), 70, 70, 40, 30);
  let body = drawTree(placed, { r: 20, size: 10 });
  body += text(
    20,
    296,
    "有重複元素的子集（LC 90）：先排序，同一層中「與前一個相同」的分支會產生重複的子樹，直接跳過（紅）。",
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    316,
    "條件 i > start && nums[i] == nums[i−1]：只禁止同一層，不禁止同一條路徑上連續選相同的數。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(680, 332, body);
}

function mergeSortTree(): string {
  const a = [5, 2, 4, 7, 1, 3, 2, 6];
  const build = (l: number, r: number): TreeNode => {
    const seg = a.slice(l, r + 1);
    if (l === r) return { label: seg.join(""), fill: C.blueSoft };
    const m = (l + r) >> 1;
    return {
      label: seg.join(""),
      fill: C.paper,
      note: `→ ${[...seg].sort((x, y) => x - y).join("")}`,
      noteColor: C.green,
      children: [build(l, m), build(m + 1, r)],
    };
  };
  const placed = layoutTree(build(0, a.length - 1), 66, 72, 40, 30);
  let body = "";
  for (const p of placed) {
    const label = String(p.node.label);
    const w = label.length * 10 + 14;
    if (p.parent)
      body += line(p.parent.x, p.parent.y + 12, p.x, p.y - 12, {
        stroke: C.line,
      });
    body += rect(p.x - w / 2, p.y - 12, w, 24, {
      fill: p.node.fill ?? C.paper,
      stroke: C.ink,
      rx: 4,
    });
    body += text(p.x, p.y + 1, label, { mono: true, size: 12 });
    if (p.node.note)
      body += text(p.x, p.y + 24, p.node.note, {
        size: 11,
        mono: true,
        fill: C.green,
        halo: true,
      });
  }
  body += text(
    20,
    290,
    "分治：拆成兩半分別排序（遞），再把兩個有序段合併（歸，綠色是合併結果）。",
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    310,
    "每層合併共 O(n)，共 log n 層 → T(n) = 2T(n/2) + O(n) = O(n log n)。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 326, body);
}

function meetMiddle(): string {
  let body = "";
  body += rect(40, 40, 520, 36, { fill: C.gray, stroke: C.ink, rx: 4 });
  body += rect(40, 40, 260, 36, { fill: C.blueSoft, stroke: C.ink, rx: 4 });
  body += rect(300, 40, 260, 36, { fill: C.orangeSoft, stroke: C.ink, rx: 4 });
  body += text(170, 58, "前半 n/2 個元素", { size: 12 });
  body += text(430, 58, "後半 n/2 個元素", { size: 12 });
  body += line(170, 80, 170, 120, {
    arrow: "end",
    stroke: C.blue,
    marker: "ah-blue",
  });
  body += line(430, 80, 430, 120, {
    arrow: "end",
    stroke: C.orange,
    marker: "ah-orange",
  });
  body += box2(100, 124, 140, 44, "枚舉 2^(n/2) 個\n子集和 → 排序", C.blueSoft);
  body += box2(360, 124, 140, 44, "枚舉 2^(n/2) 個\n子集和", C.orangeSoft);
  body += line(360, 146, 244, 146, {
    arrow: "end",
    stroke: C.green,
    marker: "ah-green",
    sw: 1.8,
  });
  body += text(302, 138, "二分 / 雙指標配對", {
    size: 11,
    fill: C.green,
    weight: "bold",
  });
  body += text(
    40,
    200,
    "n = 40 時 2⁴⁰ ≈ 10¹² 無法暴力，但 2 × 2²⁰ ≈ 2×10⁶ 可以：兩半分別枚舉，再用排序 + 二分（或雙指標）合併。",
    { anchor: "start", size: 12 },
  );
  body += text(
    40,
    222,
    "總複雜度 O(2^(n/2) · n)。適用條件：答案能拆成「前半的貢獻 ⊕ 後半的貢獻」。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 238, body);
}

function box2(
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  fill: string,
): string {
  const lines = label.split("\n");
  return (
    rect(x, y, w, h, { fill, stroke: C.ink, rx: 6 }) +
    lines
      .map((l, i) =>
        text(x + w / 2, y + h / 2 + (i - (lines.length - 1) / 2) * 17, l, {
          size: 12,
        }),
      )
      .join("")
  );
}

// ---------------------------------------------------------------------------
// Strings
// ---------------------------------------------------------------------------

function kmpFigure(): string {
  const p = "ababaca";
  const n = p.length;
  const pi = new Array<number>(n).fill(0);
  for (let i = 1, k = 0; i < n; i++) {
    while (k > 0 && p.charAt(i) !== p.charAt(k)) k = at(pi, k - 1);
    if (p.charAt(i) === p.charAt(k)) k++;
    pi[i] = k;
  }
  const cell = 40;
  const x0 = 80;
  let body = text(x0 - 12, 30 + 20, "p", {
    anchor: "end",
    size: 13,
    mono: true,
  });
  const hi = 4; // pi[4] = 3 : "aba" is both prefix and suffix of "ababa"
  body += array(x0, 30, p.split(""), {
    cell,
    showIndex: true,
    indexBelow: false,
    fill: (i) =>
      i <= hi
        ? i < at(pi, hi)
          ? C.blueSoft
          : i > hi - at(pi, hi)
            ? C.orangeSoft
            : C.paper
        : undefined,
  });
  // overlap region cell (index 2) is both prefix and suffix: show both via stripes
  body += rect(x0 + (hi - at(pi, hi) + 1) * cell, 30, at(pi, hi) * cell, cell, {
    stroke: C.orange,
    sw: 2.4,
  });
  body += rect(x0, 30, at(pi, hi) * cell, cell, {
    stroke: C.blue,
    sw: 2.4,
    dash: "5 3",
  });
  body += text(x0 - 12, 100 + 20, "π", { anchor: "end", size: 13, mono: true });
  body += array(x0, 100, pi, {
    cell,
    fill: (i) => (i === hi ? C.greenSoft : undefined),
  });
  body += text(x0, 166, "π[i] = p[0..i] 的「最長相等真前綴與真後綴」長度。", {
    anchor: "start",
    size: 12,
  });
  body += text(
    x0,
    186,
    `例：π[${hi}] = ${at(pi, hi)}，因為 "${p.slice(0, hi + 1)}" 的前綴（藍虛框）與後綴（橘框）都是 "${p.slice(0, at(pi, hi))}"。`,
    { anchor: "start", size: 12 },
  );
  // Mismatch demo
  const t = "abababac";
  const y = 216;
  body += panelTitle(20, y, "失配時：模式串不必從頭比，直接讓 j = π[j−1]");
  body += text(x0 - 12, y + 40, "t", { anchor: "end", size: 13, mono: true });
  body += array(x0, y + 20, t.split(""), {
    cell,
    h: 34,
    size: 13,
    fill: (i) => (i === 5 ? C.redSoft : i < 5 ? C.greenSoft : undefined),
  });
  body += text(x0 - 12, y + 84, "p", { anchor: "end", size: 13, mono: true });
  body += array(x0, y + 66, p.split(""), {
    cell,
    h: 34,
    size: 13,
    fill: (i) => (i === 5 ? C.redSoft : i < 5 ? C.greenSoft : undefined),
    dim: (i) => i > 5,
  });
  body += text(x0 - 12, y + 130, "p 右移後", {
    anchor: "end",
    size: 11,
    fill: C.orange,
  });
  const shift = 5 - at(pi, 4);
  body += array(x0 + shift * cell, y + 112, p.split(""), {
    cell,
    h: 34,
    size: 13,
    fill: (i) => (i < at(pi, 4) ? C.blueSoft : undefined),
    dim: (i) => i >= at(pi, 4) + 1,
  });
  body += text(
    x0,
    y + 172,
    `t[5]='${t.charAt(5)}' ≠ p[5]='${p.charAt(5)}'：令 j ← π[4] = ${at(pi, 4)}。p 的前 ${at(pi, 4)} 個字元（藍）已知與 t 相等，t 的指標不回退，下一步比較 t[5] 與 p[${at(pi, 4)}]。`,
    { anchor: "start", size: 12 },
  );
  return svg(720, y + 188, body);
}

function zFigure(): string {
  const s = "aabxaabxcaab";
  const n = s.length;
  const z = new Array<number>(n).fill(0);
  z[0] = n;
  for (let i = 1, l = 0, r = 0; i < n; i++) {
    if (i <= r) z[i] = Math.min(r - i + 1, at(z, i - l));
    while (i + at(z, i) < n && s.charAt(at(z, i)) === s.charAt(i + at(z, i)))
      z[i] = at(z, i) + 1;
    if (i + at(z, i) - 1 > r) {
      l = i;
      r = i + at(z, i) - 1;
    }
  }
  const cell = 40;
  const x0 = 60;
  const hi = 4;
  let body = text(x0 - 12, 30 + 20, "s", {
    anchor: "end",
    size: 13,
    mono: true,
  });
  body += array(x0, 30, s.split(""), {
    cell,
    showIndex: true,
    indexBelow: false,
    fill: (i) =>
      i >= hi && i < hi + at(z, hi)
        ? C.orangeSoft
        : i < at(z, hi)
          ? C.blueSoft
          : undefined,
  });
  body += text(x0 - 12, 100 + 20, "z", { anchor: "end", size: 13, mono: true });
  body += array(x0, 100, z, {
    cell,
    fill: (i) => (i === hi ? C.greenSoft : undefined),
  });
  body += text(
    x0,
    170,
    `z[i] = s 與 s[i..] 的最長公共前綴。例：z[${hi}] = ${at(z, hi)}，s[${hi}..] 以 "${s.slice(hi, hi + at(z, hi))}" 開頭，與 s 的前綴（藍）相同。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    x0,
    192,
    "維護最右的匹配區間 [l, r]（z-box）：i 落在其中時，z[i] 至少是 min(r − i + 1, z[i − l])，只需從 r 之後繼續比。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  body += text(
    x0,
    214,
    "r 只增不減 → O(n)。找 p 在 t 中的出現：對 p + '#' + t 求 z，z[i] = |p| 的位置即匹配。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 230, body);
}

function manacher(): string {
  const s = "abacabad";
  const t = "#" + s.split("").join("#") + "#";
  const n = t.length;
  const d = new Array<number>(n).fill(0);
  for (let i = 0, l = 0, r = -1; i < n; i++) {
    let k = i > r ? 1 : Math.min(at(d, l + r - i), r - i + 1);
    while (i - k >= 0 && i + k < n && t.charAt(i - k) === t.charAt(i + k)) k++;
    d[i] = k;
    if (i + k - 1 > r) {
      l = i - k + 1;
      r = i + k - 1;
    }
  }
  let best = 0;
  d.forEach((v, i) => v > at(d, best) && (best = i));
  const cell = 30;
  const x0 = 40;
  let body = array(x0, 40, t.split(""), {
    cell,
    size: 12,
    showIndex: true,
    indexBelow: false,
    fill: (i) =>
      Math.abs(i - best) < at(d, best)
        ? i === best
          ? C.orangeSoft
          : C.yellowSoft
        : undefined,
    color: (i) => (t.charAt(i) === "#" ? C.line : C.ink),
  });
  body += text(x0 - 8, 100 + 15, "d", { anchor: "end", size: 12, mono: true });
  body += array(x0, 100, d, {
    cell,
    h: 30,
    size: 11,
    fill: (i) => (i === best ? C.orangeSoft : undefined),
  });
  // radius bars
  body += line(
    x0 + (best - at(d, best) + 1) * cell,
    150,
    x0 + (best + at(d, best)) * cell,
    150,
    { stroke: C.orange, sw: 3 },
  );
  body += text(
    x0 + best * cell + cell / 2,
    166,
    `以 ${best} 為中心，半徑 d = ${at(d, best)}`,
    { size: 11, fill: C.orange, weight: "bold" },
  );
  body += text(
    20,
    200,
    `在字元間插入 '#'，奇偶長度的迴文統一成奇數長度。原字串最長迴文長度 = d − 1 = ${at(d, best) - 1}（"${s.slice((best - at(d, best) + 1) / 2, (best + at(d, best) - 1) / 2)}"）。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    222,
    "利用對稱：若 i 在目前最右迴文 [l, r] 內，d[i] ≥ min(d[l + r − i], r − i + 1)，再往外擴。r 單調 → O(n)。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(600, 238, body);
}

function rollingHash(): string {
  const s = "abcab";
  const B = 31;
  const cell = 50;
  const x0 = 80;
  const H = [0];
  for (const ch of s) H.push(at(H, H.length - 1) * B + (ch.charCodeAt(0) - 96));
  let body = text(x0 - 12, 30 + 20, "s", {
    anchor: "end",
    size: 13,
    mono: true,
  });
  body += array(x0 + cell / 2, 30, s.split(""), {
    cell,
    showIndex: true,
    indexBelow: false,
    fill: (i) => (i >= 3 ? C.orangeSoft : i < 2 ? C.blueSoft : undefined),
  });
  body += text(x0 - 12, 110 + 20, "H", { anchor: "end", size: 13, mono: true });
  body += array(x0, 110, H, {
    cell,
    size: 11,
    showIndex: true,
    fill: (i) => (i === 3 || i === 5 ? C.orangeSoft : undefined),
  });
  const sub = (l: number, r: number) => at(H, r) - at(H, l) * B ** (r - l);
  body += text(
    x0,
    200,
    `H[i] = H[i−1]·B + s[i−1]（此處 B = ${B}，a=1、b=2、c=3；實作時要對大質數取模）`,
    { anchor: "start", size: 12, mono: false },
  );
  body += text(
    x0,
    222,
    `hash(s[l..r)) = H[r] − H[l]·B^(r−l)。例：hash(s[3..5)) = ${at(H, 5)} − ${at(H, 3)}·${B}² = ${sub(3, 5)} = hash(s[0..2)) = ${sub(0, 2)}`,
    { anchor: "start", size: 12, mono: false, fill: C.orange },
  );
  body += text(
    x0,
    244,
    "預處理 O(n) 後任意子字串比較 O(1)；用雙模數或隨機底數降低碰撞機率。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(660, 260, body);
}

function minRotation(): string {
  const s = "bcaab";
  const n = s.length;
  const rots = Array.from({ length: n }, (_, i) => s.slice(i) + s.slice(0, i));
  let best = 0;
  rots.forEach((r, i) => r < at(rots, best) && (best = i));
  const cell = 32;
  let body = panelTitle(20, 20, `"${s}" 的所有循環同構（旋轉）`);
  rots.forEach((r, i) => {
    const y = 36 + i * 38;
    body += text(40, y + 16, `從 ${i} 開始`, {
      anchor: "start",
      size: 11,
      fill: C.muted,
    });
    body += array(110, y, r.split(""), {
      cell,
      h: 30,
      size: 13,
      fill: () => (i === best ? C.greenSoft : undefined),
    });
    if (i === best)
      body += text(110 + n * cell + 12, y + 16, "← 字典序最小", {
        anchor: "start",
        size: 12,
        fill: C.green,
        weight: "bold",
      });
  });
  const tx = 400;
  body += text(tx, 50, "最小表示法（雙指標 i, j, k）：", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(tx, 74, "比較從 i、j 開始的兩個旋轉，", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 96, "相同的前 k 個字元之後出現", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 118, "s[i+k] > s[j+k] 時，", {
    anchor: "start",
    size: 12,
    mono: false,
  });
  body += text(tx, 140, "i..i+k 都不可能是答案 → i += k+1。", {
    anchor: "start",
    size: 12,
    fill: C.orange,
  });
  body += text(tx, 170, "i、j 各至多前進 n → O(n)，", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 192, "暴力比較所有旋轉則是 O(n²)。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(660, 36 + n * 38 + 10, body);
}

function acAutomaton(): string {
  const words = ["he", "she", "his", "hers"];
  interface N {
    id: number;
    ch: string;
    kids: Map<string, N>;
    fail: N | null;
    end: boolean;
    depth: number;
  }
  let idc = 0;
  const root: N = {
    id: idc++,
    ch: "",
    kids: new Map(),
    fail: null,
    end: false,
    depth: 0,
  };
  for (const w of words) {
    let cur = root;
    for (const ch of w) {
      if (!cur.kids.has(ch))
        cur.kids.set(ch, {
          id: idc++,
          ch,
          kids: new Map(),
          fail: null,
          end: false,
          depth: cur.depth + 1,
        });
      cur = cur.kids.get(ch)!;
    }
    cur.end = true;
  }
  const q: N[] = [];
  for (const k of root.kids.values()) {
    k.fail = root;
    q.push(k);
  }
  for (let h = 0; h < q.length; h++) {
    const u = at(q, h);
    for (const [ch, v] of u.kids) {
      let f = u.fail;
      while (f && !f.kids.has(ch)) f = f.fail;
      v.fail = f ? f.kids.get(ch)! : root;
      q.push(v);
    }
  }
  const toTree = (n: N): TreeNode => ({
    label: n.ch || "·",
    fill: n.end ? C.greenSoft : C.blueSoft,
    children: [...n.kids.values()].map(toTree),
  });
  const placed = layoutTree(toTree(root), 60, 62, 40, 30);
  // Map nodes to placed by DFS order.
  const flat: N[] = [];
  const dfs = (n: N) => {
    flat.push(n);
    n.kids.forEach(dfs);
  };
  dfs(root);
  const posOf = new Map<N, [number, number]>();
  flat.forEach((n, i) => posOf.set(n, [at(placed, i).x, at(placed, i).y]));
  let body = "";
  for (const n of flat) {
    if (!n.fail || n.fail === root) continue;
    const [x1, y1] = posOf.get(n)!;
    const [x2, y2] = posOf.get(n.fail)!;
    body += path(
      `M${x1 - 10},${y1 - 10} Q${(x1 + x2) / 2 - 30},${(y1 + y2) / 2 - 30} ${x2 + 12},${y2 + 8}`,
      { stroke: C.red, dash: "5 3", sw: 1.6, arrow: "end", marker: "ah-red" },
    );
  }
  body += drawTree(placed, { r: 16 });
  const tx = 420;
  body += text(tx, 40, `模式串：${words.join(", ")}`, {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(tx, 68, "黑邊：字典樹；綠色：某模式串結尾。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 90, "紅虛線：fail 指標（指回根的省略）。", {
    anchor: "start",
    size: 12,
    fill: C.red,
  });
  body += text(tx, 120, "fail(u) = u 代表的字串的最長真後綴，", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 142, "且該後綴也是某模式串的前綴。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 172, '例："she" 的 fail 指向 "he"：', {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 194, "在 she 結束時，he 也同時出現。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 224, "BFS 建 fail，文字串掃一次即可找出", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 246, "所有模式串的所有出現。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(700, 300, body);
}

function suffixArray(): string {
  const s = "banana";
  const n = s.length;
  const sa = Array.from({ length: n }, (_, i) => i).sort((a, b) =>
    s.slice(a) < s.slice(b) ? -1 : 1,
  );
  const lcp = sa.map((v, k) => {
    if (k === 0) return 0;
    const a = s.slice(at(sa, k - 1));
    const b = s.slice(v);
    let t = 0;
    while (t < a.length && t < b.length && a.charAt(t) === b.charAt(t)) t++;
    return t;
  });
  const x0 = 40;
  let body = text(x0, 24, "排名", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(x0 + 60, 24, "sa", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(x0 + 110, 24, "後綴（按字典序排序）", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(x0 + 330, 24, "height", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  sa.forEach((st, k) => {
    const y = 50 + k * 30;
    if (k % 2)
      body += rect(x0 - 10, y - 14, 420, 28, { fill: C.gray, stroke: "none" });
    body += text(x0 + 10, y, k, { mono: true, size: 12 });
    body += text(x0 + 70, y, st, { mono: true, size: 12, fill: C.blue });
    const suf = s.slice(st);
    const h = at(lcp, k);
    body += `<text x="${x0 + 110}" y="${y}" dominant-baseline="middle" font-family="'JetBrains Mono', monospace" font-size="14"><tspan fill="${C.orange}" font-weight="bold">${suf.slice(0, h)}</tspan><tspan>${suf.slice(h)}</tspan></text>`;
    body += text(x0 + 350, y, h, {
      mono: true,
      size: 12,
      fill: h ? C.orange : C.muted,
      weight: h ? "bold" : undefined,
    });
  });
  const tx = 480;
  body += text(tx, 50, `s = "${s}"`, {
    anchor: "start",
    size: 13,
    mono: true,
    weight: "bold",
  });
  body += text(tx, 78, "sa[k]：排名第 k 的後綴起點", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 100, "height[k]：與前一名的 LCP（橘）", {
    anchor: "start",
    size: 12,
    fill: C.orange,
  });
  body += text(tx, 130, "不同子字串數 =", { anchor: "start", size: 12 });
  body += text(
    tx,
    152,
    `Σ(n − sa[k]) − Σheight = ${(n * (n + 1)) / 2 - lcp.reduce((a, b) => a + b, 0)}`,
    { anchor: "start", size: 12, mono: true },
  );
  body += text(tx, 182, "最長重複子字串 = max height", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 204, `= ${Math.max(...lcp)}（"ana"）`, {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(700, 50 + n * 30 + 6, body);
}

function subseqAutomaton(): string {
  const s = "abcab";
  const n = s.length;
  const alpha = ["a", "b", "c"];
  const nxt: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(alpha.length).fill(n),
  );
  for (let i = n - 1; i >= 0; i--) {
    alpha.forEach((_, c) => (at(nxt, i)[c] = at(at(nxt, i + 1), c)));
    at(nxt, i)[alpha.indexOf(s.charAt(i))] = i;
  }
  const cell = 44;
  const x0 = 110;
  const y0 = 60;
  let body = text(x0 - 12, 30, "s", { anchor: "end", size: 12, mono: true });
  body += array(x0, 12, s.split(""), { cell, h: 30, size: 13 });
  body += gridHeaders(
    x0,
    y0,
    cell,
    alpha.map((a) => `nxt[·][${a}]`),
    Array.from({ length: n + 1 }, (_, i) => `i=${i}`),
  );
  const query = "ab";
  const pathCells = new Set<string>();
  let pos = 0;
  for (const ch of query) {
    const c = alpha.indexOf(ch);
    pathCells.add(`${c},${pos}`);
    pos = at(at(nxt, pos), c) + 1;
  }
  body += grid(x0, y0, alpha.length, n + 1, {
    cell,
    label: (r, c) => (at(at(nxt, c), r) === n ? "∅" : at(at(nxt, c), r)),
    fill: (r, c) => (pathCells.has(`${r},${c}`) ? C.orangeSoft : undefined),
    size: 13,
  });
  body += text(
    20,
    y0 + alpha.length * cell + 30,
    "nxt[i][c] = 從下標 i（含）往後，字元 c 第一次出現的位置；由後往前 O(n·Σ) 建表。",
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    y0 + alpha.length * cell + 52,
    `判斷 "${query}" 是否為子序列：i=0 查 a → 0，i=1 查 b → 1（橘）。每個字元 O(1)，適合大量詢問（LC 792）。`,
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, y0 + alpha.length * cell + 68, body);
}

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

function countingSort(): string {
  const a = [2, 5, 3, 0, 2, 3, 0, 3];
  const K = 6;
  const cnt = new Array<number>(K).fill(0);
  a.forEach((v) => (cnt[v] = at(cnt, v) + 1));
  const pre: number[] = [];
  cnt.reduce((s, c, i) => ((pre[i] = s), s + c), 0);
  const out = [...a].sort((x, y) => x - y);
  const cell = 44;
  const x0 = 110;
  let body = text(x0 - 12, 30 + 18, "輸入", { anchor: "end", size: 12 });
  body += array(x0, 30, a, { cell, h: 36 });
  body += text(x0 - 12, 100 + 18, "cnt", {
    anchor: "end",
    size: 12,
    mono: true,
  });
  body += array(x0, 100, cnt, {
    cell,
    h: 36,
    showIndex: true,
    indexBelow: false,
    fill: () => C.blueSoft,
  });
  body += text(x0 - 12, 160 + 18, "起始位置", { anchor: "end", size: 12 });
  body += array(x0, 160, pre, { cell, h: 36, fill: () => C.orangeSoft });
  body += text(x0 - 12, 230 + 18, "輸出", { anchor: "end", size: 12 });
  body += array(x0, 230, out, {
    cell,
    h: 36,
    fill: (i) =>
      [
        C.blueSoft,
        C.greenSoft,
        C.orangeSoft,
        C.purpleSoft,
        C.yellowSoft,
        C.redSoft,
      ][at(out, i)],
  });
  body += text(
    20,
    300,
    "1. 數每個值出現幾次；2. 字首和得到每個值在輸出中的起始位置；3. 按位置放回（從後往前放可保持穩定）。",
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    322,
    "O(n + K)，K 是值域大小——值域小時比 O(n log n) 的比較排序更快。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 338, body);
}

function radixSort(): string {
  const a = [170, 45, 75, 90, 802, 24, 2, 66];
  const rows: number[][] = [a];
  let cur = [...a];
  for (let e = 1; e <= 100; e *= 10) {
    const buckets: number[][] = Array.from({ length: 10 }, () => []);
    cur.forEach((v) => at(buckets, Math.floor(v / e) % 10).push(v));
    cur = buckets.flat();
    rows.push(cur);
  }
  const cell = 56;
  const x0 = 130;
  const labels = ["輸入", "按個位", "按十位", "按百位"];
  let body = "";
  rows.forEach((r, k) => {
    const y = 20 + k * 56;
    body += text(x0 - 12, y + 18, at(labels, k), { anchor: "end", size: 12 });
    r.forEach((v, i) => {
      const str = String(v).padStart(3, "0");
      body += rect(x0 + i * cell, y, cell - 4, 36, {
        fill: k === rows.length - 1 ? C.greenSoft : C.paper,
        stroke: C.ink,
        rx: 3,
      });
      const digit = 3 - k;
      body += `<text x="${x0 + i * cell + (cell - 4) / 2}" y="${y + 19}" text-anchor="middle" dominant-baseline="middle" font-family="'JetBrains Mono', monospace" font-size="14">${str
        .split("")
        .map((ch, t) =>
          k > 0 && t === digit
            ? `<tspan fill="${C.orange}" font-weight="bold">${ch}</tspan>`
            : `<tspan>${ch}</tspan>`,
        )
        .join("")}</text>`;
    });
  });
  body += text(
    20,
    20 + rows.length * 56 + 6,
    "LSD 基數排序：從最低位到最高位，每一輪用「穩定」的計數排序按該位排。橘色是本輪排序依據的那一位。",
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    20 + rows.length * 56 + 28,
    "穩定性保證較低位已排好的順序不被打亂。d 位數 → O(d·(n + 10))。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 20 + rows.length * 56 + 44, body);
}

function bucketSort(): string {
  const a = [0.42, 0.32, 0.23, 0.52, 0.25, 0.47, 0.51, 0.08, 0.91];
  const B = 5;
  const buckets: number[][] = Array.from({ length: B }, () => []);
  a.forEach((v) => at(buckets, Math.min(B - 1, Math.floor(v * B))).push(v));
  const x0 = 40;
  let body = text(x0, 24, `輸入：${a.join(", ")}`, {
    anchor: "start",
    size: 12,
    mono: true,
  });
  const bw = 110;
  buckets.forEach((b, k) => {
    const x = x0 + k * (bw + 8);
    body += rect(x, 50, bw, 150, { fill: C.gray, stroke: C.ink, rx: 4 });
    body += text(
      x + bw / 2,
      214,
      `[${(k / B).toFixed(1)}, ${((k + 1) / B).toFixed(1)})`,
      { size: 11, mono: true, fill: C.muted },
    );
    [...b]
      .sort((p, q) => p - q)
      .forEach((v, t) => {
        body += rect(x + 10, 170 - t * 32, bw - 20, 26, {
          fill: C.blueSoft,
          stroke: C.blue,
          rx: 3,
        });
        body += text(x + bw / 2, 170 - t * 32 + 13, v, {
          size: 12,
          mono: true,
        });
      });
  });
  body += text(
    20,
    246,
    "按值域把元素分到 B 個桶，桶內各自排序後依序串接。資料均勻分布時每桶約 n/B 個，期望 O(n + B)。",
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    268,
    "LeetCode 常見用法：最大間距 (LC 164)——答案一定跨桶，只需比較相鄰非空桶的 max 與 min。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 284, body);
}

export const part6Figures: BookFigure[] = [
  {
    id: "list-delete",
    category: "trees",
    section: "1.2 刪除節點",
    caption: "用哨兵節點刪除連結串列中的節點",
    render: deleteNode,
  },
  {
    id: "list-reverse",
    category: "trees",
    section: "1.4 反轉連結串列",
    caption: "反轉連結串列：pre / cur 兩個指標逐步翻轉",
    render: reverseList,
  },
  {
    id: "list-gap",
    category: "trees",
    section: "1.5 前後指標",
    caption: "前後指標：刪除倒數第 N 個節點 (LC 19)",
    render: nthFromEnd,
  },
  {
    id: "list-cycle",
    category: "trees",
    section: "1.6 快慢指標",
    caption: "Floyd 判圈：快慢指標相遇後找入環點",
    render: floydCycle,
  },
  {
    id: "list-merge",
    category: "trees",
    section: "1.8 合併連結串列",
    caption: "合併兩個有序連結串列 (LC 21)",
    render: mergeLists,
  },
  {
    id: "tree-traversal",
    category: "trees",
    section: "2.1 遍歷二叉樹",
    caption: "先序、中序、後序：同一條路線的三個處理時機",
    render: traversals,
  },
  {
    id: "tree-topdown",
    category: "trees",
    section: "2.2 自頂向下 DFS（先序遍歷）",
    caption: "自頂向下：把祖先資訊當參數往下傳",
    render: topDown,
  },
  {
    id: "tree-bottomup",
    category: "trees",
    section: "2.3 自底向上 DFS（後序遍歷）",
    caption: "自底向上：把子樹答案當回傳值往上合併",
    render: bottomUp,
  },
  {
    id: "tree-lca",
    category: "trees",
    section: "2.8 最近公共祖先",
    caption: "二叉樹的最近公共祖先 (LC 236)",
    render: lcaFigure,
  },
  {
    id: "tree-bst",
    category: "trees",
    section: "2.9 二叉搜索樹",
    caption: "二叉搜尋樹：每個節點的合法值域與中序遞增",
    render: bstRanges,
  },
  {
    id: "tree-build",
    category: "trees",
    section: "2.10 建立二叉樹",
    caption: "由先序與中序建構二叉樹 (LC 105)",
    render: buildFromOrders,
  },
  {
    id: "tree-bfs",
    category: "trees",
    section: "2.13 二叉樹 BFS",
    caption: "二叉樹的層序遍歷",
    render: levelOrder,
  },
  {
    id: "tree-peel",
    category: "trees",
    section: "3.6 樹的拓撲排序",
    caption: "逐層剝葉子：找樹的中心 (LC 310)",
    render: leafPeeling,
  },
  {
    id: "tree-tin",
    category: "trees",
    section: "3.7 DFS 時間戳",
    caption: "DFS 時間戳：子樹對應 DFS 序上的連續區間",
    render: eulerTour,
  },
  {
    id: "tree-lift",
    category: "trees",
    section: "3.8 最近公共祖先（LCA）、倍增演算法",
    caption: "倍增：預處理 2^k 級祖先，按二進位往上跳",
    render: binaryLifting,
  },
  {
    id: "bt-subset",
    category: "trees",
    section: "4.2 子集型回溯",
    caption: "子集型回溯的遞迴樹：選或不選",
    render: subsetTree,
  },
  {
    id: "bt-partition",
    category: "trees",
    section: "4.3 劃分型回溯",
    caption: "劃分型回溯：分割迴文串 (LC 131)",
    render: partitionTree,
  },
  {
    id: "bt-comb",
    category: "trees",
    section: "4.4 組合型回溯",
    caption: "組合型回溯與剪枝：C(4, 2)",
    render: combTree,
  },
  {
    id: "bt-perm",
    category: "trees",
    section: "4.5 排列型回溯",
    caption: "排列型回溯的遞迴樹",
    render: permTree,
  },
  {
    id: "bt-dup",
    category: "trees",
    section: "4.6 有重複元素的回溯",
    caption: "同層去重：跳過與前一個相同的分支",
    render: dupSkip,
  },
  {
    id: "bt-mitm",
    category: "trees",
    section: "4.8 折半列舉",
    caption: "折半列舉（meet in the middle）",
    render: meetMiddle,
  },
  {
    id: "dc-merge",
    category: "trees",
    section: "5.1 應用題",
    caption: "分治的遞迴樹：合併排序",
    render: mergeSortTree,
  },

  {
    id: "str-kmp",
    category: "string",
    section: "1.1 基礎",
    caption: "KMP：字首函數 π 與失配時的跳轉",
    render: kmpFigure,
  },
  {
    id: "str-z",
    category: "string",
    section: "2.1 基礎",
    caption: "Z 函數：每個位置與整個字串的最長公共前綴",
    render: zFigure,
  },
  {
    id: "str-manacher",
    category: "string",
    section: "3.1 基礎",
    caption: "Manacher：插入分隔符後的迴文半徑",
    render: manacher,
  },
  {
    id: "str-hash",
    category: "string",
    section: "4.1 基礎",
    caption: "字串雜湊：字首雜湊與子字串雜湊",
    render: rollingHash,
  },
  {
    id: "str-minrot",
    category: "string",
    section: "5.1 基礎",
    caption: "最小表示法：字典序最小的旋轉",
    render: minRotation,
  },
  {
    id: "str-ac",
    category: "string",
    section: "7.1 基礎",
    caption: "AC 自動機：字典樹加上 fail 指標",
    render: acAutomaton,
  },
  {
    id: "str-sa",
    category: "string",
    section: "8.1 基礎",
    caption: "後綴陣列與 height 陣列（banana）",
    render: suffixArray,
  },
  {
    id: "str-subseq",
    category: "string",
    section: "9.1 基礎",
    caption: "子序列自動機：下一個字元位置表",
    render: subseqAutomaton,
  },

  {
    id: "sort-count",
    category: "sorting",
    section: "1. 計數排序",
    caption: "計數排序：計數、字首和、放回",
    render: countingSort,
  },
  {
    id: "sort-radix",
    category: "sorting",
    section: "2. 基數排序",
    caption: "LSD 基數排序的三輪",
    render: radixSort,
  },
  {
    id: "sort-bucket",
    category: "sorting",
    section: "3. 桶排序",
    caption: "桶排序：按值域分桶再合併",
    render: bucketSort,
  },
];
