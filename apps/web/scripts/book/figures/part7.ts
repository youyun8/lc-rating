/**
 * Figures added with the difficulty edition: warm-up sections of the 簡單篇
 * that had no drawing yet (stack, queue, two pointers, linked-list insertion,
 * tree recursion, trial division, partition greedy, bit reversal). As in the
 * other parts, every state is produced by running the algorithm on the
 * example the lecture uses.
 */
import type { BookFigure } from "./types";
import {
  C,
  array,
  chip,
  circle,
  curve,
  drawTree,
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
// Stack and queue
// ---------------------------------------------------------------------------

/** Horizontal stack: bottom on the left, top cell outlined. */
function stackCells(
  x: number,
  y: number,
  items: (string | number)[],
  o: { cell?: number; fill?: string; topFill?: string } = {},
): string {
  const cell = o.cell ?? 34;
  if (!items.length)
    return (
      rect(x, y, cell * 1.6, cell, {
        stroke: C.line,
        dash: "3 3",
        rx: 3,
      }) +
      text(x + cell * 0.8, y + cell / 2 + 1, "空", { size: 11, fill: C.muted })
    );
  let out = array(x, y, items, {
    cell,
    size: 13,
    fill: (i) =>
      i === items.length - 1 ? (o.topFill ?? C.blueSoft) : (o.fill ?? C.gray),
  });
  out += rect(x + (items.length - 1) * cell, y, cell, cell, {
    stroke: C.blue,
    sw: 2.2,
  });
  return out;
}

function simplifyPath(): string {
  const input = "/a/./b/../../c/";
  const parts = input.split("/").filter((p) => p !== "");
  const st: string[] = [];
  const rowH = 46;
  const x0 = 250;
  let body = panelTitle(
    20,
    20,
    `簡化路徑 "${input}"：棧裡是「目前所在的目錄層」`,
  );
  body += text(40, 48, "片段", { size: 11, fill: C.muted });
  body += text(150, 48, "動作", { size: 11, fill: C.muted });
  body += text(x0, 48, "棧（左為棧底，藍框為棧頂）", {
    size: 11,
    fill: C.muted,
    anchor: "start",
  });
  parts.forEach((p, i) => {
    let action: string;
    let color: string;
    if (p === ".") {
      action = "略過";
      color = C.muted;
    } else if (p === "..") {
      if (st.length) st.pop();
      action = "pop：退回上一層";
      color = C.red;
    } else {
      st.push(p);
      action = "push：進入目錄";
      color = C.green;
    }
    const y = 62 + i * rowH;
    body += rect(22, y, 36, 30, { fill: C.paper, rx: 4 });
    body += text(40, y + 16, p, { mono: true, size: 14, weight: "bold" });
    body += text(150, y + 16, action, {
      size: 12,
      fill: color,
      weight: "bold",
    });
    body += stackCells(x0, y - 2, [...st]);
  });
  const yEnd = 62 + parts.length * rowH + 8;
  body += chip(x0, yEnd + 6, `結果 "/${st.join("/")}"`, {
    fill: C.blue,
    anchor: "start",
  });
  return svg(560, yEnd + 22, body);
}

function adjacentElimination(): string {
  const s = "abbaca";
  const st: string[] = [];
  const rowH = 44;
  const x0 = 250;
  let body = panelTitle(
    20,
    20,
    `刪除相鄰重複項 "${s}"：棧頂就是新字元的左鄰居`,
  );
  body += text(40, 48, "讀入", { size: 11, fill: C.muted });
  body += text(150, 48, "和棧頂比較", { size: 11, fill: C.muted });
  body += text(x0, 48, "棧（藍框為棧頂）", {
    size: 11,
    fill: C.muted,
    anchor: "start",
  });
  for (let i = 0; i < s.length; i++) {
    const c = s.charAt(i);
    const y = 62 + i * rowH;
    const top = st[st.length - 1];
    let action: string;
    let color: string;
    if (top === c) {
      st.pop();
      action = `相同 → 一起消掉`;
      color = C.red;
    } else {
      st.push(c);
      action = top === undefined ? "棧空 → push" : `不同 → push`;
      color = C.green;
    }
    body += rect(22, y, 36, 30, { fill: C.paper, rx: 4 });
    body += text(40, y + 16, c, { mono: true, size: 14, weight: "bold" });
    body += text(150, y + 16, action, {
      size: 12,
      fill: color,
      weight: "bold",
    });
    body += stackCells(x0, y - 2, [...st]);
  }
  const yEnd = 62 + s.length * rowH + 8;
  body += chip(x0, yEnd + 6, `剩下 "${st.join("")}"`, {
    fill: C.blue,
    anchor: "start",
  });
  return svg(560, yEnd + 22, body);
}

function recentCounter(): string {
  const pings = [1, 100, 3001, 3002];
  const q: number[] = [];
  const rowH = 58;
  const x0 = 210;
  const cell = 52;
  let body = panelTitle(
    20,
    20,
    "最近的請求次數：時間戳遞增入隊，過期的只會出現在隊頭",
  );
  pings.forEach((t, i) => {
    q.push(t);
    const expired: number[] = [];
    while (at(q, 0) < t - 3000) expired.push(q.shift()!);
    const y = 48 + i * rowH;
    body += text(20, y + 18, `ping(${t})`, {
      anchor: "start",
      mono: true,
      size: 13,
      weight: "bold",
    });
    body += text(20, y + 36, `視窗 [${t - 3000}, ${t}]`, {
      anchor: "start",
      size: 10.5,
      fill: C.muted,
      mono: true,
    });
    const shown = [...expired, ...q];
    body += array(x0, y + 4, shown, {
      cell,
      h: 30,
      size: 13,
      fill: (j) =>
        j < expired.length
          ? C.redSoft
          : j === shown.length - 1
            ? C.greenSoft
            : C.blueSoft,
      dim: (j) => j < expired.length,
    });
    for (let j = 0; j < expired.length; j++) {
      const cx = x0 + j * cell;
      body += line(cx + 6, y + 8, cx + cell - 6, y + 30, {
        stroke: C.red,
        sw: 1.6,
      });
    }
    body += chip(x0 + shown.length * cell + 50, y + 19, `回傳 ${q.length}`, {
      fill: C.blue,
    });
  });
  const yEnd = 48 + pings.length * rowH;
  body += text(
    x0,
    yEnd + 6,
    "紅色：從隊頭 pop 的過期請求\u3000綠色：剛入隊的請求",
    {
      size: 11,
      fill: C.muted,
      anchor: "start",
    },
  );
  return svg(560, yEnd + 18, body);
}

// ---------------------------------------------------------------------------
// Two pointers
// ---------------------------------------------------------------------------

function reverseString(): string {
  const s = "hello".split("");
  const cell = 40;
  const x0 = 150;
  const rowH = 98;
  let body = "";
  let l = 0;
  let r = s.length - 1;
  let row = 0;
  const draw = (label: string, swapped: [number, number] | null) => {
    const y = 34 + row * rowH;
    body += text(20, y + cell / 2, label, {
      anchor: "start",
      size: 12,
      fill: C.muted,
    });
    body += array(x0, y, [...s], {
      cell,
      showIndex: row === 0,
      indexBelow: false,
      fill: (i) =>
        swapped && (i === swapped[0] || i === swapped[1])
          ? C.orangeSoft
          : i < l || i > r
            ? C.greenSoft
            : undefined,
    });
    if (l < r) {
      body += pointer(x0 + l * cell + cell / 2, y + cell, "l", {
        below: true,
        len: 13,
      });
      body += pointer(x0 + r * cell + cell / 2, y + cell, "r", {
        below: true,
        len: 13,
        color: C.orange,
      });
    } else {
      body += pointer(x0 + l * cell + cell / 2, y + cell, "l = r：停", {
        below: true,
        len: 13,
        color: C.green,
      });
    }
    if (swapped) {
      const [a, b] = swapped;
      body += curve(
        x0 + a * cell + cell / 2,
        y - 4,
        x0 + b * cell + cell / 2,
        y - 4,
        -14,
        { stroke: C.orange, arrow: "both", marker: "ah-orange", sw: 1.4 },
      );
    }
    row++;
  };
  draw("初始", null);
  while (l < r) {
    const a = l;
    const b = r;
    [s[a], s[b]] = [at(s, b), at(s, a)];
    l++;
    r--;
    draw(`swap(s[${a}], s[${b}])`, [a, b]);
  }
  body += text(
    x0 + 5 * cell + 24,
    34 + (row - 1) * rowH + cell / 2,
    `→ "${s.join("")}"`,
    {
      anchor: "start",
      mono: true,
      size: 14,
      weight: "bold",
      fill: C.green,
    },
  );
  return svg(560, 34 + row * rowH - 6, body);
}

function twoSumSorted(): string {
  const a = [1, 2, 4, 6, 8, 11];
  const target = 10;
  const cell = 42;
  const x0 = 60;
  const rowH = 78;
  let body = panelTitle(
    20,
    18,
    `有序陣列找兩數之和 = ${target}：每一步排除一整列候選`,
  );
  let l = 0;
  let r = a.length - 1;
  let row = 0;
  for (;;) {
    const y = 52 + row * rowH;
    const s = at(a, l) + at(a, r);
    const lo = l;
    const hi = r;
    body += array(x0, y, a, {
      cell,
      showIndex: row === 0,
      indexBelow: false,
      dim: (i) => i < lo || i > hi,
      fill: (i) => (i === lo || i === hi ? C.blueSoft : undefined),
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
    let msg: string;
    let color: string;
    if (s === target) {
      msg = `${at(a, l)} + ${at(a, r)} = ${s}：命中`;
      color = C.green;
    } else if (s > target) {
      msg = `${at(a, l)} + ${at(a, r)} = ${s} > ${target}：a[r] 配誰都太大，r--`;
      color = C.orange;
    } else {
      msg = `${at(a, l)} + ${at(a, r)} = ${s} < ${target}：a[l] 配誰都太小，l++`;
      color = C.blue;
    }
    body += text(x0 + a.length * cell + 18, y + cell / 2, msg, {
      anchor: "start",
      size: 12,
      fill: color,
      weight: "bold",
    });
    row++;
    if (s === target || l >= r) break;
    if (s > target) r--;
    else l++;
  }
  return svg(600, 52 + row * rowH - 4, body);
}

// ---------------------------------------------------------------------------
// Linked list insertion
// ---------------------------------------------------------------------------

function listInsert(): string {
  const w = 40;
  const h = 30;
  const xs = [40, 150, 260];
  const vals = [1, 3, 4];
  const panelH = 118;
  let body = "";
  const node = (
    x: number,
    y: number,
    v: number | string,
    fill: string = C.paper,
  ) =>
    rect(x, y, w, h, { fill, rx: 4 }) +
    text(x + w / 2, y + h / 2 + 1, v, { mono: true, size: 13 });
  const arrow = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string = C.ink,
    dash?: string,
  ) =>
    line(x1, y1, x2, y2, {
      stroke: color,
      arrow: "end",
      marker:
        color === C.orange
          ? "ah-orange"
          : color === C.green
            ? "ah-green"
            : "ah",
      sw: color === C.ink ? 1.4 : 2,
      dash,
    });
  const steps: { title: string; newNext: boolean; prevToNew: boolean }[] = [
    {
      title: "插入前：prev 指向 3，新節點 2 尚未接上",
      newNext: false,
      prevToNew: false,
    },
    {
      title: "① node->next = prev->next（新節點先接住後面）",
      newNext: true,
      prevToNew: false,
    },
    {
      title: "② prev->next = node（prev 再放手交棒）",
      newNext: true,
      prevToNew: true,
    },
  ];
  steps.forEach((st, k) => {
    const y0 = 24 + k * panelH;
    body += panelTitle(20, y0, st.title, { color: k ? C.blue : C.ink });
    const y = y0 + 22;
    vals.forEach((v, i) => {
      body += node(at(xs, i), y, v, i === 0 ? C.blueSoft : C.paper);
    });
    body += text(at(xs, 0) + w / 2, y - 7, "prev", {
      size: 11,
      fill: C.blue,
      weight: "bold",
    });
    // 3 -> 4 always
    body += arrow(at(xs, 1) + w, y + h / 2, at(xs, 2) - 2, y + h / 2);
    body += arrow(
      at(xs, 2) + w,
      y + h / 2,
      at(xs, 2) + w + 40,
      y + h / 2,
      C.ink,
    );
    body += text(at(xs, 2) + w + 58, y + h / 2, "null", {
      size: 11,
      mono: true,
      fill: C.muted,
    });
    // new node below, between 1 and 3
    const nx = (at(xs, 0) + at(xs, 1)) / 2;
    const ny = y + 52;
    body += node(nx, ny, 2, C.greenSoft);
    body += text(nx + w + 26, ny + h / 2, "node", {
      size: 11,
      fill: C.green,
      weight: "bold",
    });
    if (st.prevToNew) {
      body += arrow(at(xs, 0) + w / 2, y + h, nx + 8, ny - 2, C.orange);
      body += line(at(xs, 0) + w, y + h / 2, at(xs, 1), y + h / 2, {
        stroke: C.line,
        sw: 1.2,
        dash: "3 3",
      });
      body += text((at(xs, 0) + w + at(xs, 1)) / 2, y + h / 2 - 7, "斷開", {
        size: 10,
        fill: C.muted,
      });
    } else {
      body += arrow(at(xs, 0) + w, y + h / 2, at(xs, 1) - 2, y + h / 2);
    }
    if (st.newNext) {
      body += arrow(nx + w - 8, ny, at(xs, 1) + w / 2, y + h + 2, C.green);
    }
  });
  // Run the two pointer assignments on a real list and read it back.
  const next = new Map<number, number | null>([
    [1, 3],
    [3, 4],
    [4, null],
    [2, null],
  ]);
  const prev = 1;
  const inserted = 2;
  next.set(inserted, next.get(prev)!); // node->next = prev->next
  next.set(prev, inserted); // prev->next = node
  const finalList: number[] = [];
  for (let v: number | null = 1; v !== null; v = next.get(v) ?? null)
    finalList.push(v);
  body += chip(330, 24 + 2 * panelH + 74, `結果：${finalList.join(" → ")}`, {
    fill: C.blue,
    anchor: "start",
  });
  return svg(560, 24 + 3 * panelH - 10, body);
}

// ---------------------------------------------------------------------------
// Binary trees
// ---------------------------------------------------------------------------

interface BT {
  v: number;
  l?: BT;
  r?: BT;
}

function diameterTree(): string {
  // 1(2(4(6(9)), 5(_, 7(_, 8))), 3): the turning point is unique (node 2).
  const root: BT = {
    v: 1,
    l: {
      v: 2,
      l: { v: 4, l: { v: 6, l: { v: 9 } } },
      r: { v: 5, r: { v: 7, r: { v: 8 } } },
    },
    r: { v: 3 },
  };
  // Run the lecture's DFS: return max(L, R) + 1, answer max(L + R).
  const arm = new Map<BT, [number, number]>();
  let best = -1;
  let bestNode: BT = root;
  const dfs = (n: BT | undefined): number => {
    if (!n) return 0;
    const L = dfs(n.l);
    const R = dfs(n.r);
    arm.set(n, [L, R]);
    if (L + R > best) {
      best = L + R;
      bestNode = n;
    }
    return Math.max(L, R) + 1;
  };
  dfs(root);
  // The diameter path: from bestNode go down the deeper side on each branch.
  const onPath = new Set<BT>([bestNode]);
  const descend = (n: BT | undefined) => {
    while (n) {
      onPath.add(n);
      const [L, R] = arm.get(n)!;
      n = L >= R ? n.l : n.r;
      if (!L && !R) break;
    }
  };
  descend(bestNode.l);
  descend(bestNode.r);
  const toTree = (n: BT): TreeNode => {
    const [L, R] = arm.get(n)!;
    const kids: (TreeNode | null)[] =
      n.l || n.r ? [n.l ? toTree(n.l) : null, n.r ? toTree(n.r) : null] : [];
    return {
      label: n.v,
      fill:
        n === bestNode ? C.orangeSoft : onPath.has(n) ? C.blueSoft : C.paper,
      stroke: onPath.has(n) ? C.blue : C.ink,
      note: `L=${L} R=${R}`,
      noteColor: n === bestNode ? C.orange : C.muted,
      children: kids,
      edgeColor:
        onPath.has(n) && n !== root && onPathParent(n) ? C.blue : undefined,
    };
  };
  const parentOf = new Map<BT, BT>();
  const link = (n: BT) => {
    for (const c of [n.l, n.r])
      if (c) {
        parentOf.set(c, n);
        link(c);
      }
  };
  link(root);
  const onPathParent = (n: BT) => {
    const p = parentOf.get(n);
    return !!p && onPath.has(p);
  };
  const placed = layoutTree(toTree(root), 70, 72, 40, 46);
  let body = drawTree(placed, { r: 17 });
  body += panelTitle(
    20,
    18,
    "每個節點標出左右臂長；轉折點（橘）的 L + R 就是直徑",
  );
  body += chip(380, 330, `直徑 = ${best}（條邊）`, {
    fill: C.orange,
    anchor: "start",
  });
  body += text(380, 360, "回傳給父親：max(L, R) + 1", {
    size: 11.5,
    fill: C.muted,
    anchor: "start",
    mono: true,
  });
  body += text(380, 380, "更新答案\u3000：L + R", {
    size: 11.5,
    fill: C.muted,
    anchor: "start",
    mono: true,
  });
  return svg(600, 400, body);
}

function pruneTree(): string {
  // LeetCode 814 example: [1,0,1,0,0,0,1]
  const root: BT = {
    v: 1,
    l: { v: 0, l: { v: 0 }, r: { v: 0 } },
    r: { v: 1, l: { v: 0 }, r: { v: 1 } },
  };
  const removed = new Set<BT>();
  // Bottom-up: a subtree is dropped when it contains no 1.
  const dfs = (n: BT | undefined): boolean => {
    if (!n) return false;
    const l = dfs(n.l);
    const r = dfs(n.r);
    if (n.l && !l) removed.add(n.l);
    if (n.r && !r) removed.add(n.r);
    return l || r || n.v === 1;
  };
  dfs(root);
  const order: BT[] = [];
  const post = (n: BT | undefined) => {
    if (!n) return;
    post(n.l);
    post(n.r);
    order.push(n);
  };
  post(root);
  const gone = (n: BT): boolean => {
    for (let p: BT | undefined = n; p; p = parentMap.get(p))
      if (removed.has(p)) return true;
    return false;
  };
  const parentMap = new Map<BT, BT>();
  const link = (n: BT) => {
    for (const c of [n.l, n.r])
      if (c) {
        parentMap.set(c, n);
        link(c);
      }
  };
  link(root);
  const toTree = (n: BT, after: boolean): TreeNode => ({
    label: n.v,
    fill: !after && gone(n) ? C.redSoft : n.v === 1 ? C.blueSoft : C.paper,
    stroke: !after && gone(n) ? C.red : C.ink,
    dashed: !after && gone(n),
    note: after ? undefined : `#${order.indexOf(n) + 1}`,
    noteColor: C.muted,
    children:
      n.l || n.r
        ? [
            n.l && !(after && removed.has(n.l)) ? toTree(n.l, after) : null,
            n.r && !(after && removed.has(n.r)) ? toTree(n.r, after) : null,
          ]
        : [],
  });
  let body = panelTitle(20, 18, "剪枝前（#k 為後序處理順序）");
  body += drawTree(layoutTree(toTree(root, false), 58, 70, 30, 58), { r: 16 });
  body += panelTitle(330, 18, "剪枝後：不含 1 的子樹整片移除");
  const afterTree = toTree(root, true);
  body += drawTree(layoutTree(afterTree, 58, 70, 380, 58), { r: 16 });
  body += line(310, 30, 310, 250, { stroke: C.faint, sw: 1 });
  body += text(150, 262, "紅色虛線：dfs 回傳 nullptr，父親把指標接空", {
    size: 11,
    fill: C.red,
  });
  return svg(600, 274, body);
}

// ---------------------------------------------------------------------------
// Math / greedy / bits
// ---------------------------------------------------------------------------

function trialDivision(): string {
  const cases = [91, 97];
  const cell = 46;
  const x0 = 120;
  let body = panelTitle(
    20,
    18,
    "根號枚舉：i 只試到 i × i ≤ n；找到因數就提早停",
  );
  cases.forEach((n, k) => {
    const y = 60 + k * 112;
    const tries: { i: number; rem: number }[] = [];
    let factor = -1;
    for (let i = 2; i * i <= n; i++) {
      tries.push({ i, rem: n % i });
      if (n % i === 0) {
        factor = i;
        break;
      }
    }
    const limit = Math.floor(Math.sqrt(n));
    const all: number[] = [];
    for (let i = 2; i <= limit; i++) all.push(i);
    body += text(20, y + cell / 2 - 7, `n = ${n}`, {
      anchor: "start",
      mono: true,
      size: 14,
      weight: "bold",
    });
    body += text(20, y + cell / 2 + 11, `√n ≈ ${Math.sqrt(n).toFixed(2)}`, {
      anchor: "start",
      mono: true,
      size: 11,
      fill: C.muted,
    });
    body += array(x0, y, all, {
      cell,
      h: 30,
      size: 13,
      fill: (j) =>
        at(all, j) === factor
          ? C.redSoft
          : j < tries.length
            ? C.blueSoft
            : C.gray,
      dim: (j) => j >= tries.length,
    });
    all.forEach((i, j) => {
      const t = tries[j];
      body += text(x0 + j * cell + cell / 2, y + 46, t ? `餘 ${t.rem}` : "", {
        size: 10.5,
        fill: t?.rem === 0 ? C.red : C.muted,
        mono: true,
      });
    });
    body += text(x0 + all.length * cell + 14, y + 15, "i", {
      size: 11,
      fill: C.muted,
    });
    const verdict =
      factor > 0
        ? `${n} = ${factor} × ${n / factor}：不是質數（試了 ${tries.length} 次）`
        : `試到 ${limit} 都整除不了：${n} 是質數（試了 ${tries.length} 次，不是 ${n - 2} 次）`;
    body += text(x0, y + 72, verdict, {
      anchor: "start",
      size: 12,
      weight: "bold",
      fill: factor > 0 ? C.red : C.green,
    });
  });
  return svg(560, 60 + 2 * 112 - 18, body);
}

function balancedSplit(): string {
  const s = "RLRRLLRLRL";
  const step = 44;
  const x0 = 50;
  const unit = 36;
  let body = panelTitle(
    20,
    18,
    `分割平衡字串 "${s}"：L 記 +1、R 記 −1，計數歸零就切一刀`,
  );
  // Run the greedy and record the balance after each character.
  const bal: number[] = [0];
  const cuts: number[] = [];
  let b = 0;
  for (let i = 0; i < s.length; i++) {
    b += s.charAt(i) === "L" ? 1 : -1;
    bal.push(b);
    if (b === 0) cuts.push(i + 1);
  }
  const plotTop = 66;
  const yMid = plotTop + 24 + Math.max(0, ...bal) * unit;
  const plotBottom = yMid + Math.max(0, -Math.min(...bal)) * unit + 24;
  const ys = bal.map((v) => yMid - v * unit);
  body += line(x0, yMid, x0 + s.length * step + 10, yMid, {
    stroke: C.line,
    sw: 1,
    dash: "3 3",
  });
  body += text(x0 - 8, yMid, "0", {
    anchor: "end",
    size: 11,
    fill: C.muted,
    mono: true,
  });
  for (const v of [Math.min(...bal), Math.max(...bal)]) {
    if (v === 0) continue;
    body += text(x0 - 8, yMid - v * unit, (v > 0 ? "+" : "") + v, {
      anchor: "end",
      size: 11,
      fill: C.muted,
      mono: true,
    });
  }
  let prevCut = 0;
  cuts.forEach((c, k) => {
    body += rect(
      x0 + prevCut * step,
      40,
      (c - prevCut) * step,
      plotBottom - 40,
      {
        fill: k % 2 ? C.gray : C.blueSoft,
        stroke: "none",
        opacity: 0.6,
      },
    );
    body += chip(x0 + ((prevCut + c) / 2) * step, 50, `第 ${k + 1} 段`, {
      fill: C.blue,
      size: 10.5,
    });
    prevCut = c;
  });
  let d = `M${x0},${at(ys, 0)}`;
  for (let i = 1; i < ys.length; i++) d += ` L${x0 + i * step},${at(ys, i)}`;
  body += path(d, { stroke: C.ink, sw: 2 });
  bal.forEach((v, i) => {
    const isCut = i > 0 && cuts.includes(i);
    body += circle(x0 + i * step, at(ys, i), isCut ? 5.5 : 3.5, {
      fill: isCut ? C.orange : C.ink,
      stroke: isCut ? C.orange : C.ink,
    });
  });
  for (const c of cuts) {
    body += line(x0 + c * step, plotTop, x0 + c * step, plotBottom, {
      stroke: C.orange,
      sw: 2,
    });
  }
  for (let i = 0; i < s.length; i++) {
    body += text(x0 + (i + 0.5) * step, plotBottom + 22, s.charAt(i), {
      mono: true,
      size: 15,
      weight: "bold",
      fill: s.charAt(i) === "L" ? C.green : C.red,
    });
  }
  body += chip(x0 + s.length * step + 20, yMid, `${cuts.length} 段`, {
    fill: C.orange,
    anchor: "start",
  });
  return svg(560, plotBottom + 36, body);
}

function bitReverse(): string {
  const bits = 8;
  const n = 0b00001011;
  let res = 0;
  for (let i = 0; i < bits; i++) res |= ((n >> i) & 1) << (bits - 1 - i);
  const cell = 46;
  const x0 = 80;
  const yTop = 56;
  const yBot = 196;
  const bitAt = (v: number, pos: number) => (v >> pos) & 1;
  // Cells are drawn most-significant first: column j holds bit (bits-1-j).
  const top = Array.from({ length: bits }, (_, j) => bitAt(n, bits - 1 - j));
  const bot = Array.from({ length: bits }, (_, j) => bitAt(res, bits - 1 - j));
  let body = panelTitle(
    20,
    20,
    "逐位翻轉（以 8 位為例）：第 i 位搬到第 7 − i 位",
  );
  body += text(x0 - 12, yTop + 18, "n", {
    anchor: "end",
    mono: true,
    size: 14,
    weight: "bold",
  });
  body += text(x0 - 12, yBot + 18, "res", {
    anchor: "end",
    mono: true,
    size: 14,
    weight: "bold",
  });
  body += array(x0, yTop, top, {
    cell,
    h: 36,
    fill: (j) => (at(top, j) ? C.blueSoft : undefined),
    bold: (j) => at(top, j) === 1,
  });
  body += array(x0, yBot, bot, {
    cell,
    h: 36,
    fill: (j) => (at(bot, j) ? C.orangeSoft : undefined),
    bold: (j) => at(bot, j) === 1,
  });
  for (let j = 0; j < bits; j++) {
    body += text(x0 + j * cell + cell / 2, yTop - 9, `b${bits - 1 - j}`, {
      size: 10.5,
      fill: C.muted,
      mono: true,
    });
    body += text(x0 + j * cell + cell / 2, yBot + 50, `b${bits - 1 - j}`, {
      size: 10.5,
      fill: C.muted,
      mono: true,
    });
  }
  for (let i = 0; i < bits; i++) {
    if (!bitAt(n, i)) continue;
    const from = x0 + (bits - 1 - i) * cell + cell / 2;
    const to = x0 + i * cell + cell / 2;
    body += line(from, yTop + 38, to, yBot - 2, {
      stroke: C.orange,
      sw: 1.6,
      arrow: "end",
      marker: "ah-orange",
    });
  }
  const bin = (v: number) => v.toString(2).padStart(bits, "0");
  body += text(x0 + bits * cell + 16, yTop + 18, `= ${n}`, {
    anchor: "start",
    mono: true,
    size: 13,
  });
  body += text(x0 + bits * cell + 16, yBot + 18, `= ${res}`, {
    anchor: "start",
    mono: true,
    size: 13,
  });
  body += text(
    x0,
    yBot + 76,
    `${bin(n)} → ${bin(res)}：只有值為 1 的位元需要畫箭頭`,
    {
      anchor: "start",
      size: 11.5,
      fill: C.muted,
    },
  );
  return svg(560, yBot + 88, body);
}

function topKExchange(): string {
  const a = [5, 1, 8, 3, 9, 2];
  const k = 3;
  const sorted = [...a].sort((x, y) => y - x);
  const greedy = sorted.slice(0, k);
  const gSum = greedy.reduce((s, v) => s + v, 0);
  // A non-greedy choice and the exchange that repairs it.
  const other = [9, 5, 3];
  const oSum = other.reduce((s, v) => s + v, 0);
  const x = Math.min(...other.filter((v) => !greedy.includes(v)));
  const y = Math.max(...greedy.filter((v) => !other.includes(v)));
  const swapped = other.map((v) => (v === x ? y : v));
  const sSum = swapped.reduce((s, v) => s + v, 0);
  const cell = 44;
  const x0 = 170;
  let body = panelTitle(
    20,
    18,
    `選 ${k} 個數使總和最大：排序後取前 ${k} 大，交換論證保證安全`,
  );
  const row = (
    yy: number,
    label: string,
    chosen: number[],
    sum: number,
    color: string,
    mark?: number,
  ) => {
    body += text(20, yy + cell / 2, label, {
      anchor: "start",
      size: 12,
      fill: C.muted,
    });
    body += array(x0, yy, sorted, {
      cell,
      fill: (i) =>
        chosen.includes(at(sorted, i))
          ? at(sorted, i) === mark
            ? C.orangeSoft
            : C.blueSoft
          : undefined,
      dim: (i) => !chosen.includes(at(sorted, i)),
      bold: (i) => chosen.includes(at(sorted, i)),
    });
    body += chip(x0 + sorted.length * cell + 50, yy + cell / 2, `和 = ${sum}`, {
      fill: color,
    });
  };
  row(46, "某個選法", other, oSum, C.muted, x);
  row(150, `把 ${x} 換成 ${y}`, swapped, sSum, C.blue, y);
  row(254, "貪心：前 3 大", greedy, gSum, C.green);
  const xi = sorted.indexOf(x);
  const yi = sorted.indexOf(y);
  body += curve(
    x0 + xi * cell + cell / 2,
    46 + cell + 4,
    x0 + yi * cell + cell / 2,
    150 - 4,
    22,
    {
      stroke: C.orange,
      arrow: "end",
      marker: "ah-orange",
      sw: 1.8,
    },
  );
  body += text(
    x0 + ((xi + yi) / 2) * cell + cell / 2 + 40,
    124,
    `+${y - x}，不會變差`,
    {
      size: 11.5,
      fill: C.orange,
      weight: "bold",
    },
  );
  body += text(x0, 230, "反覆交換，任何選法都能換成貪心解而總和不減", {
    anchor: "start",
    size: 11.5,
    fill: C.muted,
  });
  return svg(600, 312, body);
}

export const part7Figures: BookFigure[] = [
  {
    id: "stack-path",
    category: "data_structure",
    section: "4.1 基礎",
    caption: "用堆疊簡化路徑：「..」彈出最近進入的目錄",
    render: simplifyPath,
  },
  {
    id: "stack-adjacent",
    category: "data_structure",
    section: "4.3 鄰項消除",
    caption: "鄰項消除：消掉棧頂後，新的棧頂立刻成為下一個左鄰居",
    render: adjacentElimination,
  },
  {
    id: "queue-recent",
    category: "data_structure",
    section: "5.1 基礎",
    caption: "最近的請求次數：遞增的時間戳讓過期請求只會出現在隊頭",
    render: recentCounter,
  },
  {
    id: "tp-reverse",
    category: "sliding_window",
    section: "11. 反轉字串",
    caption: "相向雙指標原地反轉：每次交換最外側一對，待處理區間縮小 2",
    render: reverseString,
  },
  {
    id: "tp-two-sum",
    category: "sliding_window",
    section: "18. 雙指標",
    caption: "有序陣列的兩數之和：太大移 r、太小移 l，每步排除一個端點",
    render: twoSumSorted,
  },
  {
    id: "list-insert",
    category: "trees",
    section: "1.3 插入節點",
    caption: "連結串列插入：先讓新節點接住後段，再讓 prev 指向新節點",
    render: listInsert,
  },
  {
    id: "tree-diameter-basic",
    category: "trees",
    section: "2.6 二叉樹的直徑",
    caption: "二叉樹的直徑：回傳單邊臂長，在轉折點用左右臂長之和更新答案",
    render: diameterTree,
  },
  {
    id: "tree-prune",
    category: "trees",
    section: "2.4 自底向上 DFS：刪點",
    caption: "自底向上剪枝（LeetCode 814）：子樹處理完才決定自己去留",
    render: pruneTree,
  },
  {
    id: "prime-trial",
    category: "math",
    section: "1. 判斷質數",
    caption: "根號枚舉判斷質數：91 在 i = 7 提早停下，97 只需試 8 次",
    render: trialDivision,
  },
  {
    id: "greedy-balanced-split",
    category: "greedy",
    section: "5. 劃分型貪心",
    caption: "劃分型貪心（LeetCode 1221）：計數歸零就切，段數最多",
    render: balancedSplit,
  },
  {
    id: "bits-reverse",
    category: "bitwise_operations",
    section: "1.3 反轉二進位制數",
    caption: "反轉二進位：第 i 位搬到鏡像位置",
    render: bitReverse,
  },
  {
    id: "greedy-topk-exchange",
    category: "greedy",
    section: "1. 從最小/最大開始貪心",
    caption: "交換論證：把較小的選擇換成較大的未選元素，總和不減",
    render: topKExchange,
  },
];
