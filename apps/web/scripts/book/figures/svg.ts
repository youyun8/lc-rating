/**
 * Minimal SVG drawing kit for the lecture book figures.
 *
 * Every figure is a pure function that returns an inline `<svg>` string. The
 * primitives here keep a single visual language across ~100 figures: the same
 * cell size, stroke weights, palette and label fonts. Colors are chosen to stay
 * distinguishable when the book is printed in grayscale (each fill differs in
 * lightness, not only in hue).
 */

export const C = {
  ink: "#1f2933",
  muted: "#616e7c",
  line: "#9aa5b1",
  faint: "#e4e7eb",
  paper: "#ffffff",
  gray: "#f5f7fa",
  blue: "#1d4ed8",
  blueSoft: "#dbe7ff",
  blueMid: "#93b4f5",
  orange: "#c2410c",
  orangeSoft: "#ffe4cc",
  green: "#15803d",
  greenSoft: "#d6f5df",
  red: "#b91c1c",
  redSoft: "#fde0e0",
  purple: "#6d28d9",
  purpleSoft: "#ebe2ff",
  yellowSoft: "#fff4c2",
} as const;

export const FONT_SANS = `'Noto Sans TC', 'Noto Sans CJK TC', sans-serif`;
export const FONT_MONO = `'JetBrains Mono', 'Noto Sans TC', monospace`;

export function esc(text: string | number): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function attrs(a: Record<string, string | number | undefined>): string {
  return Object.entries(a)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}="${esc(String(v))}"`)
    .join(" ");
}

/** Wrap figure body in an `<svg>` root with arrow markers predefined. */
export function svg(width: number, height: number, body: string): string {
  const marker = (id: string, color: string) =>
    `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${color}"/></marker>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" font-family="${FONT_SANS}" font-size="13" fill="${C.ink}">` +
    `<defs>${marker("ah", C.ink)}${marker("ah-blue", C.blue)}${marker("ah-orange", C.orange)}${marker("ah-green", C.green)}${marker("ah-red", C.red)}${marker("ah-muted", C.line)}${marker("ah-purple", C.purple)}</defs>` +
    body +
    `</svg>`
  );
}

export interface TextOpts {
  size?: number;
  anchor?: "start" | "middle" | "end";
  weight?: number | "bold";
  fill?: string;
  mono?: boolean;
  italic?: boolean;
  baseline?: "middle" | "auto" | "hanging";
  /** White outline behind the glyphs so labels stay legible over lines. */
  halo?: boolean;
}

export function text(
  x: number,
  y: number,
  s: string | number,
  o: TextOpts = {},
): string {
  return `<text ${attrs({
    x,
    y,
    "font-size": o.size,
    "text-anchor": o.anchor ?? "middle",
    "font-weight": o.weight,
    fill: o.fill,
    "font-family": o.mono ? FONT_MONO : undefined,
    "font-style": o.italic ? "italic" : undefined,
    "dominant-baseline": o.baseline ?? "middle",
    stroke: o.halo ? C.paper : undefined,
    "stroke-width": o.halo ? 3.5 : undefined,
    "stroke-linejoin": o.halo ? "round" : undefined,
    "paint-order": o.halo ? "stroke" : undefined,
  })}>${esc(s)}</text>`;
}

export interface ShapeOpts {
  fill?: string;
  stroke?: string;
  sw?: number;
  rx?: number;
  dash?: string;
  opacity?: number;
}

export function rect(
  x: number,
  y: number,
  w: number,
  h: number,
  o: ShapeOpts = {},
): string {
  return `<rect ${attrs({
    x,
    y,
    width: w,
    height: h,
    rx: o.rx,
    fill: o.fill ?? "none",
    stroke: o.stroke ?? C.ink,
    "stroke-width": o.sw ?? 1.2,
    "stroke-dasharray": o.dash,
    opacity: o.opacity,
  })}/>`;
}

export function circle(
  cx: number,
  cy: number,
  r: number,
  o: ShapeOpts = {},
): string {
  return `<circle ${attrs({
    cx,
    cy,
    r,
    fill: o.fill ?? C.paper,
    stroke: o.stroke ?? C.ink,
    "stroke-width": o.sw ?? 1.4,
    "stroke-dasharray": o.dash,
    opacity: o.opacity,
  })}/>`;
}

export interface LineOpts {
  stroke?: string;
  sw?: number;
  dash?: string;
  arrow?: "end" | "both" | "start";
  marker?:
    | "ah"
    | "ah-blue"
    | "ah-orange"
    | "ah-green"
    | "ah-red"
    | "ah-muted"
    | "ah-purple";
  opacity?: number;
}

function markerFor(o: LineOpts) {
  const m = o.marker ?? "ah";
  return {
    "marker-end":
      o.arrow === "end" || o.arrow === "both" ? `url(#${m})` : undefined,
    "marker-start":
      o.arrow === "start" || o.arrow === "both" ? `url(#${m})` : undefined,
  };
}

export function line(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  o: LineOpts = {},
): string {
  return `<line ${attrs({
    x1,
    y1,
    x2,
    y2,
    stroke: o.stroke ?? C.ink,
    "stroke-width": o.sw ?? 1.3,
    "stroke-dasharray": o.dash,
    opacity: o.opacity,
    ...markerFor(o),
  })}/>`;
}

export function path(d: string, o: LineOpts & { fill?: string } = {}): string {
  return `<path ${attrs({
    d,
    fill: o.fill ?? "none",
    stroke: o.stroke ?? C.ink,
    "stroke-width": o.sw ?? 1.3,
    "stroke-dasharray": o.dash,
    opacity: o.opacity,
    ...markerFor(o),
  })}/>`;
}

/** Quadratic curved arrow from (x1,y1) to (x2,y2) bulging by `bend`. */
export function curve(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  bend: number,
  o: LineOpts = {},
): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / len) * bend;
  const cy = my + (dx / len) * bend;
  return path(`M${x1},${y1} Q${cx},${cy} ${x2},${y2}`, o);
}

export const g = (body: string, transform?: string) =>
  transform ? `<g transform="${transform}">${body}</g>` : `<g>${body}</g>`;

// ---------------------------------------------------------------------------
// Arrays
// ---------------------------------------------------------------------------

export interface ArrayOpts {
  cell?: number;
  h?: number;
  fill?: (i: number) => string | undefined;
  color?: (i: number) => string | undefined;
  showIndex?: boolean;
  indexBase?: number;
  indexBelow?: boolean;
  bold?: (i: number) => boolean;
  dim?: (i: number) => boolean;
  size?: number;
}

/** Draw a horizontal array of cells whose top-left corner is (x, y). */
export function array(
  x: number,
  y: number,
  values: (string | number)[],
  o: ArrayOpts = {},
): string {
  const w = o.cell ?? 40;
  const h = o.h ?? w;
  let out = "";
  values.forEach((v, i) => {
    const dim = o.dim?.(i) ?? false;
    out += rect(x + i * w, y, w, h, {
      fill: o.fill?.(i) ?? C.paper,
      stroke: dim ? C.line : C.ink,
      sw: 1.2,
    });
    out += text(x + i * w + w / 2, y + h / 2 + 1, v, {
      mono: true,
      size: o.size ?? 15,
      fill: dim ? C.line : (o.color?.(i) ?? C.ink),
      weight: o.bold?.(i) ? "bold" : undefined,
    });
    if (o.showIndex) {
      const iy = o.indexBelow === false ? y - 10 : y + h + 13;
      out += text(x + i * w + w / 2, iy, i + (o.indexBase ?? 0), {
        size: 11,
        fill: C.muted,
        mono: true,
      });
    }
  });
  return out;
}

/** A labelled pointer arrow pointing at the centre of a cell from above/below. */
export function pointer(
  cx: number,
  yTip: number,
  label: string,
  o: { color?: string; below?: boolean; len?: number; size?: number } = {},
): string {
  const color = o.color ?? C.blue;
  const len = o.len ?? 20;
  const marker =
    color === C.blue
      ? "ah-blue"
      : color === C.orange
        ? "ah-orange"
        : color === C.green
          ? "ah-green"
          : color === C.red
            ? "ah-red"
            : color === C.purple
              ? "ah-purple"
              : "ah";
  if (o.below) {
    return (
      line(cx, yTip + len, cx, yTip + 2, {
        stroke: color,
        sw: 1.6,
        arrow: "end",
        marker,
      }) +
      text(cx, yTip + len + 11, label, {
        fill: color,
        size: o.size ?? 13,
        weight: "bold",
        mono: true,
      })
    );
  }
  return (
    line(cx, yTip - len, cx, yTip - 2, {
      stroke: color,
      sw: 1.6,
      arrow: "end",
      marker,
    }) +
    text(cx, yTip - len - 9, label, {
      fill: color,
      size: o.size ?? 13,
      weight: "bold",
      mono: true,
    })
  );
}

/** A square bracket spanning [x1, x2] below (or above) y, with a label. */
export function brace(
  x1: number,
  x2: number,
  y: number,
  label: string,
  o: { color?: string; above?: boolean; depth?: number; size?: number } = {},
): string {
  const color = o.color ?? C.ink;
  const d = (o.depth ?? 8) * (o.above ? -1 : 1);
  const p = `M${x1},${y} L${x1},${y + d} L${x2},${y + d} L${x2},${y}`;
  const ly = y + d + (o.above ? -11 : 12);
  return (
    path(p, { stroke: color, sw: 1.3 }) +
    text((x1 + x2) / 2, ly, label, { fill: color, size: o.size ?? 12 })
  );
}

// ---------------------------------------------------------------------------
// Legend
// ---------------------------------------------------------------------------

export function legend(
  x: number,
  y: number,
  items: [string, string][],
  gap = 22,
): string {
  let out = "";
  let cx = x;
  for (const [fill, label] of items) {
    out += rect(cx, y - 7, 14, 14, { fill, stroke: C.ink, sw: 1 });
    out += text(cx + 20, y, label, {
      anchor: "start",
      size: 12,
      fill: C.muted,
    });
    cx += 20 + label.length * 12.5 + gap;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Trees and graphs
// ---------------------------------------------------------------------------

export interface TreeNode {
  label: string | number;
  children?: (TreeNode | null)[];
  fill?: string;
  stroke?: string;
  note?: string;
  noteColor?: string;
  edgeLabel?: string;
  edgeColor?: string;
  dashed?: boolean;
}

export interface PlacedNode {
  node: TreeNode;
  x: number;
  y: number;
  parent?: PlacedNode;
}

/**
 * Tidy-ish tree layout: leaves get consecutive slots, parents sit centred
 * above their children. `null` children reserve half a slot (keeps binary
 * trees left/right readable).
 */
export function layoutTree(
  root: TreeNode,
  slot: number,
  level: number,
  x0 = 0,
  y0 = 0,
): PlacedNode[] {
  const placed: PlacedNode[] = [];
  let cursor = 0;
  const visit = (
    node: TreeNode,
    depth: number,
    parent?: PlacedNode,
  ): PlacedNode => {
    const me: PlacedNode = { node, x: 0, y: y0 + depth * level, parent };
    placed.push(me);
    const kids = node.children ?? [];
    if (kids.length === 0 || kids.every((k) => k === null)) {
      me.x = x0 + cursor * slot;
      cursor += 1;
      return me;
    }
    const xs: number[] = [];
    kids.forEach((k) => {
      if (k === null) {
        xs.push(x0 + (cursor - 0.25) * slot);
        cursor += 0.5;
      } else {
        xs.push(visit(k, depth + 1, me).x);
      }
    });
    const real = kids
      .map((k, i) => (k ? xs[i]! : undefined))
      .filter((v): v is number => v !== undefined);
    if (real.length === 1 && kids.length === 2) {
      // Single child: offset the parent so left/right is visible.
      const isLeft = kids[0] !== null;
      me.x = real[0]! + (isLeft ? slot * 0.5 : -slot * 0.5);
    } else {
      me.x = (Math.min(...real) + Math.max(...real)) / 2;
    }
    return me;
  };
  visit(root, 0);
  return placed;
}

export function drawTree(
  placed: PlacedNode[],
  o: { r?: number; size?: number; mono?: boolean } = {},
): string {
  const r = o.r ?? 17;
  let edges = "";
  let nodes = "";
  for (const p of placed) {
    if (p.parent) {
      const dx = p.x - p.parent.x;
      const dy = p.y - p.parent.y;
      const len = Math.hypot(dx, dy);
      const ux = dx / len;
      const uy = dy / len;
      edges += line(
        p.parent.x + ux * r,
        p.parent.y + uy * r,
        p.x - ux * r,
        p.y - uy * r,
        {
          stroke: p.node.edgeColor ?? C.ink,
          sw: p.node.edgeColor ? 2.4 : 1.3,
          dash: p.node.dashed ? "4 3" : undefined,
        },
      );
      if (p.node.edgeLabel) {
        edges += text(
          (p.x + p.parent.x) / 2 + (dx >= 0 ? 10 : -10),
          (p.y + p.parent.y) / 2 - 2,
          p.node.edgeLabel,
          {
            halo: true,
            size: 11,
            fill: p.node.edgeColor ?? C.muted,
            anchor: dx >= 0 ? "start" : "end",
          },
        );
      }
    }
    nodes += circle(p.x, p.y, r, {
      fill: p.node.fill ?? C.paper,
      stroke: p.node.stroke ?? C.ink,
    });
    nodes += text(p.x, p.y + 1, p.node.label, {
      size: o.size ?? 14,
      mono: o.mono ?? true,
    });
    if (p.node.note) {
      nodes += text(p.x, p.y + r + 13, p.node.note, {
        size: 11,
        fill: p.node.noteColor ?? C.muted,
        halo: true,
      });
    }
  }
  return edges + nodes;
}

export interface GNode {
  id: string | number;
  x: number;
  y: number;
  label?: string;
  fill?: string;
  stroke?: string;
  note?: string;
  noteDy?: number;
  noteColor?: string;
}

export interface GEdge {
  a: string | number;
  b: string | number;
  w?: string | number;
  directed?: boolean;
  color?: string;
  sw?: number;
  dash?: string;
  bend?: number;
  labelOffset?: number;
}

export function drawGraph(
  nodes: GNode[],
  edges: GEdge[],
  o: { r?: number; size?: number } = {},
): string {
  const r = o.r ?? 17;
  const byId = new Map(nodes.map((n) => [String(n.id), n]));
  let out = "";
  for (const e of edges) {
    const a = byId.get(String(e.a));
    const b = byId.get(String(e.b));
    if (!a || !b) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const color = e.color ?? C.ink;
    const marker =
      color === C.blue
        ? "ah-blue"
        : color === C.orange
          ? "ah-orange"
          : color === C.green
            ? "ah-green"
            : color === C.red
              ? "ah-red"
              : color === C.line
                ? "ah-muted"
                : color === C.purple
                  ? "ah-purple"
                  : "ah";
    const lo: LineOpts = {
      stroke: color,
      sw: e.sw ?? 1.4,
      dash: e.dash,
      arrow: e.directed ? "end" : undefined,
      marker,
    };
    const bend = e.bend ?? 0;
    // Rotate start/end points by the bend so arrows meet the circle rim.
    const ang = Math.atan2(dy, dx);
    const off = bend ? Math.sign(bend) * 0.35 : 0;
    const sx = a.x + Math.cos(ang + off) * r;
    const sy = a.y + Math.sin(ang + off) * r;
    const ex = b.x - Math.cos(ang - off) * (r + (e.directed ? 1.5 : 0));
    const ey = b.y - Math.sin(ang - off) * (r + (e.directed ? 1.5 : 0));
    out += bend ? curve(sx, sy, ex, ey, bend, lo) : line(sx, sy, ex, ey, lo);
    if (e.w !== undefined) {
      const lo2 = e.labelOffset ?? 11;
      const mx = (a.x + b.x) / 2 - uy * (lo2 + bend * 0.5);
      const my = (a.y + b.y) / 2 + ux * (lo2 + bend * 0.5);
      out += rect(mx - 10, my - 8, 20, 16, { fill: C.paper, stroke: "none" });
      out += text(mx, my + 1, e.w, {
        size: 12,
        mono: true,
        fill: e.color ?? C.muted,
        weight: e.color ? "bold" : undefined,
      });
    }
  }
  for (const n of nodes) {
    out += circle(n.x, n.y, r, {
      fill: n.fill ?? C.paper,
      stroke: n.stroke ?? C.ink,
    });
    out += text(n.x, n.y + 1, n.label ?? n.id, {
      size: o.size ?? 14,
      mono: true,
    });
    if (n.note) {
      out += text(n.x, n.y + (n.noteDy ?? r + 13), n.note, {
        size: 11,
        fill: n.noteColor ?? C.orange,
        weight: "bold",
        halo: true,
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Grids / tables
// ---------------------------------------------------------------------------

export interface GridOpts {
  cell?: number;
  fill?: (r: number, c: number) => string | undefined;
  label?: (r: number, c: number) => string | number | undefined;
  color?: (r: number, c: number) => string | undefined;
  bold?: (r: number, c: number) => boolean;
  size?: number;
  stroke?: string;
}

export function grid(
  x: number,
  y: number,
  rows: number,
  cols: number,
  o: GridOpts = {},
): string {
  const s = o.cell ?? 34;
  let out = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out += rect(x + c * s, y + r * s, s, s, {
        fill: o.fill?.(r, c) ?? C.paper,
        stroke: o.stroke ?? C.line,
        sw: 1,
      });
      const t = o.label?.(r, c);
      if (t !== undefined && t !== "") {
        out += text(x + c * s + s / 2, y + r * s + s / 2 + 1, t, {
          size: o.size ?? 13,
          mono: true,
          fill: o.color?.(r, c) ?? C.ink,
          weight: o.bold?.(r, c) ? "bold" : undefined,
        });
      }
    }
  }
  out += rect(x, y, cols * s, rows * s, { stroke: C.ink, sw: 1.4 });
  return out;
}

/** Row/column headers for a grid drawn with {@link grid}. */
export function gridHeaders(
  x: number,
  y: number,
  cell: number,
  rowLabels: (string | number)[] | null,
  colLabels: (string | number)[] | null,
  o: { size?: number; color?: string } = {},
): string {
  let out = "";
  rowLabels?.forEach((l, r) => {
    out += text(x - 8, y + r * cell + cell / 2 + 1, l, {
      anchor: "end",
      size: o.size ?? 12,
      fill: o.color ?? C.muted,
      mono: true,
    });
  });
  colLabels?.forEach((l, c) => {
    out += text(x + c * cell + cell / 2, y - 10, l, {
      size: o.size ?? 12,
      fill: o.color ?? C.muted,
      mono: true,
    });
  });
  return out;
}

/** Small rounded "chip" label: used for step numbers and annotations. */
export function chip(
  x: number,
  y: number,
  label: string,
  o: {
    fill?: string;
    color?: string;
    size?: number;
    anchor?: "start" | "middle";
  } = {},
): string {
  const size = o.size ?? 12;
  const w = measure(label, size) + 14;
  const left = o.anchor === "start" ? x : x - w / 2;
  return (
    rect(left, y - size * 0.8, w, size * 1.6, {
      fill: o.fill ?? C.ink,
      stroke: "none",
      rx: size * 0.8,
    }) +
    text(left + w / 2, y + 1, label, {
      size,
      fill: o.color ?? C.paper,
      weight: "bold",
    })
  );
}

/** Rough text width estimate: CJK glyphs are ~1em, Latin ~0.6em. */
export function measure(s: string, size: number): number {
  let w = 0;
  for (const ch of s) w += /[⺀-￿]/.test(ch) ? size : size * 0.6;
  return w;
}

/** A plain box with a centred (optionally multi-line) label. */
export function box(
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  o: ShapeOpts & {
    size?: number;
    color?: string;
    weight?: number | "bold";
    mono?: boolean;
  } = {},
): string {
  const lines = label.split("\n");
  const size = o.size ?? 13;
  const lh = size * 1.35;
  const top = y + h / 2 - ((lines.length - 1) * lh) / 2;
  return (
    rect(x, y, w, h, {
      fill: o.fill ?? C.paper,
      stroke: o.stroke ?? C.ink,
      sw: o.sw ?? 1.3,
      rx: o.rx ?? 6,
      dash: o.dash,
    }) +
    lines
      .map((l, i) =>
        text(x + w / 2, top + i * lh + 1, l, {
          size,
          fill: o.color,
          weight: o.weight,
          mono: o.mono,
        }),
      )
      .join("")
  );
}

/** Title strip used above sub-panels inside one figure. */
export function panelTitle(
  x: number,
  y: number,
  label: string,
  o: { anchor?: "start" | "middle"; color?: string } = {},
): string {
  return text(x, y, label, {
    size: 13,
    weight: "bold",
    anchor: o.anchor ?? "start",
    fill: o.color ?? C.ink,
  });
}

/** Axis-aligned plot frame with ticks, for function-shape figures. */
export function axes(
  x: number,
  y: number,
  w: number,
  h: number,
  o: { xLabel?: string; yLabel?: string } = {},
): string {
  return (
    line(x, y + h, x + w, y + h, { arrow: "end", sw: 1.2 }) +
    line(x, y + h, x, y, { arrow: "end", sw: 1.2 }) +
    (o.xLabel
      ? text(x + w + 6, y + h, o.xLabel, {
          anchor: "start",
          size: 12,
          fill: C.muted,
        })
      : "") +
    (o.yLabel
      ? text(x + 6, y - 4, o.yLabel, {
          anchor: "start",
          size: 12,
          fill: C.muted,
        })
      : "")
  );
}
