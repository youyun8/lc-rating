/**
 * Book cover, drawn as one SVG sized to the trim box (1 unit = 0.25 mm).
 * Motifs: an array with a sliding window, a binary tree and a small graph —
 * the three shapes the book keeps returning to.
 */
import { BOOK, PAGE } from "./config";
import { FONT_MONO, FONT_SANS, esc } from "./figures/svg";

export function coverSvg(): string {
  const W = PAGE.width * 4;
  const H = PAGE.height * 4;
  const navy = "#0f1f44";
  const ink2 = "#1c3370";
  const accent = "#f59e0b";
  const pale = "#c9d6f2";
  let art = "";

  // Background grid.
  for (let x = 0; x <= W; x += 37)
    art += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${ink2}" stroke-width="1"/>`;
  for (let y = 0; y <= H; y += 37)
    art += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${ink2}" stroke-width="1"/>`;

  // Array with a sliding window.
  const vals = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8];
  const cx0 = 56;
  const cy = 150;
  const cw = 46;
  vals.forEach((v, i) => {
    const inWin = i >= 3 && i <= 6;
    art += `<rect x="${cx0 + i * cw}" y="${cy}" width="${cw}" height="${cw}" fill="${inWin ? "#233f86" : navy}" stroke="${pale}" stroke-width="1.6"/>`;
    art += `<text x="${cx0 + i * cw + cw / 2}" y="${cy + cw / 2 + 1}" fill="${inWin ? "#fff" : pale}" font-family="${FONT_MONO}" font-size="20" text-anchor="middle" dominant-baseline="middle">${v}</text>`;
  });
  art += `<rect x="${cx0 + 3 * cw - 4}" y="${cy - 4}" width="${4 * cw + 8}" height="${cw + 8}" fill="none" stroke="${accent}" stroke-width="4" rx="4"/>`;
  art += `<text x="${cx0 + 3 * cw}" y="${cy - 16}" fill="${accent}" font-family="${FONT_MONO}" font-size="16">l</text>`;
  art += `<text x="${cx0 + 7 * cw - 10}" y="${cy - 16}" fill="${accent}" font-family="${FONT_MONO}" font-size="16">r</text>`;

  // Binary tree (lower right).
  const nodes: [number, number, number, number | null][] = [
    [0, 560, 610, null],
    [1, 470, 700, 0],
    [2, 650, 700, 0],
    [3, 420, 790, 1],
    [4, 520, 790, 1],
    [5, 610, 790, 2],
    [6, 700, 790, 2],
    [7, 385, 870, 3],
    [8, 455, 870, 3],
  ];
  const hot = new Set([0, 1, 53, 7]);
  for (const [id, x, y, p] of nodes) {
    if (p === null) continue;
    const parent = nodes[p]!;
    const onPath = hot.has(id) && hot.has(p);
    art += `<line x1="${parent[1]}" y1="${parent[2]}" x2="${x}" y2="${y}" stroke="${onPath ? accent : pale}" stroke-width="${onPath ? 4 : 2}"/>`;
  }
  for (const [id, x, y] of nodes) {
    art += `<circle cx="${x}" cy="${y}" r="20" fill="${hot.has(id) ? accent : navy}" stroke="${hot.has(id) ? accent : pale}" stroke-width="2"/>`;
  }

  // Small graph (left middle).
  const gp: [number, number][] = [
    [90, 700],
    [190, 640],
    [260, 740],
    [150, 820],
    [290, 860],
  ];
  const ge: [number, number][] = [
    [0, 1],
    [1, 2],
    [0, 3],
    [3, 2],
    [2, 4],
    [3, 4],
  ];
  for (const [a, b] of ge) {
    const pa = gp[a]!;
    const pb = gp[b]!;
    art += `<line x1="${pa[0]}" y1="${pa[1]}" x2="${pb[0]}" y2="${pb[1]}" stroke="${pale}" stroke-width="2" opacity="0.8"/>`;
  }
  for (const [x, y] of gp)
    art += `<circle cx="${x}" cy="${y}" r="13" fill="${navy}" stroke="${pale}" stroke-width="2"/>`;

  const title = `<text x="56" y="380" fill="#ffffff" font-family="${FONT_SANS}" font-weight="900" font-size="104" letter-spacing="6">${esc(BOOK.title)}</text>`;
  const sub = `<text x="60" y="450" fill="${pale}" font-family="${FONT_SANS}" font-size="30">${esc(BOOK.subtitle)}</text>`;
  const bar = `<rect x="60" y="484" width="120" height="7" fill="${accent}"/>`;
  const series = `<text x="60" y="540" fill="${pale}" font-family="${FONT_SANS}" font-size="22">${esc(BOOK.series)}</text>`;
  const author = `<text x="60" y="${H - 70}" fill="#ffffff" font-family="${FONT_SANS}" font-size="24">${esc(BOOK.authors)}</text>`;
  const tags = `<text x="60" y="${H - 110}" fill="${pale}" font-family="${FONT_MONO}" font-size="14" letter-spacing="1.5">SLIDING WINDOW · BINARY SEARCH · GRAPH · DP · SEGMENT TREE · STRING</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><rect width="${W}" height="${H}" fill="${navy}"/>${art}<rect x="0" y="300" width="${W}" height="270" fill="${navy}" opacity="0.88"/>${title}${sub}${bar}${series}${tags}${author}</svg>`;
}
