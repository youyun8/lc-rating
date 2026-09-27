#!/usr/bin/env node
/**
 * Reformat every C++ code fence in the lecture content with clang-format so
 * the web pages and the book PDF share one layout (4-space indent, 80 cols).
 *
 * Usage (from apps/web/): node scripts/formatLectureCode.mjs
 * Requires `clang-format` on PATH.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const STYLE =
  "{BasedOnStyle: Google,IndentWidth: 4,AccessModifierOffset: -4,ColumnLimit: 80,ReflowComments: false,SortIncludes: Never,DerivePointerAlignment: false,PointerAlignment: Left,AllowShortIfStatementsOnASingleLine: WithoutElse,AllowShortLoopsOnASingleLine: true,AllowShortFunctionsOnASingleLine: Inline,AllowShortLambdasOnASingleLine: All}";
const ROOT = new URL("../", import.meta.url).pathname;

function listFiles() {
  const content = path.join(ROOT, "features/lecture/content");
  const files = fs
    .readdirSync(content)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => path.join(content, f));
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (p.endsWith(".md")) files.push(p);
    }
  };
  walk(path.join(ROOT, "scripts/lecture_content"));
  return files;
}
const fmt = (code) => {
  const out = execFileSync(
    "clang-format",
    ["--style=" + STYLE, "--assume-filename=a.cpp"],
    { input: code },
  ).toString();
  return out.replace(/\s+$/, "") + "\n";
};
let total = 0,
  changed = 0;
for (const f of listFiles()) {
  let src = fs.readFileSync(f, "utf8");
  const md = f.endsWith(".md");
  src = src.replace(
    /((?:\\`){3}|```)(cpp|c\+\+)(\\n|\n)([\s\S]*?)((?:\\`){3}|```)/g,
    (all, open, lang, sep, body, close) => {
      total++;
      const esc = sep === "\\n";
      let code = body;
      if (esc)
        code = body.replace(/\\(u[0-9a-fA-F]{4}|.)/g, (_, c) =>
          c === "n"
            ? "\n"
            : c === "t"
              ? "\t"
              : c.length > 1
                ? String.fromCharCode(parseInt(c.slice(1), 16))
                : c,
        );
      else if (!md) code = body.replace(/\\([`$\\])/g, "$1");
      // strip trailing indentation of the fence line
      const trail = code.match(/\n([ \t]*)$/)?.[1] ?? "";
      const core = code.slice(0, code.length - trail.length);
      let out = fmt(core) + trail;
      if (out === code) return all;
      changed++;
      let enc = out;
      if (esc) {
        enc = out
          .replace(/\\/g, "\\\\")
          .replace(/\t/g, "\\t")
          .replace(/\n/g, "\\n");
        for (const q of ['"', "'", "`"])
          if (body.includes("\\" + q)) enc = enc.split(q).join("\\" + q);
      } else if (!md) {
        enc = out
          .replace(/\\/g, "\\\\")
          .replace(/`/g, "\\`")
          .replace(/\$\{/g, "\\${");
      }
      return open + lang + sep + enc + close;
    },
  );
  fs.writeFileSync(f, src);
}
console.log({ total, changed });
