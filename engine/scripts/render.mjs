// node scripts/render.mjs <slug>  ->  ../out/<slug>.mp4 (1080x1920, H.264, IG-ready)
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const slug = process.argv[2];
if (!slug) throw new Error("usage: node scripts/render.mjs <slug>");
const out = path.join("..", "out", `${slug}.mp4`);
// Props go through a file: Windows mangles the quotes in inline JSON.
mkdirSync(".props", { recursive: true });
const props = path.join(".props", `${slug}.json`);
writeFileSync(props, JSON.stringify({ slug }));
// Render scratch files go to D: (C: is nearly full).
const tmp = path.resolve("..", ".cache", "tmp");
mkdirSync(tmp, { recursive: true });
const bin = path.join("node_modules", ".bin", process.platform === "win32" ? "remotion.cmd" : "remotion");
execFileSync(bin, ["render", "src/index.ts", "Reel", out, `--props=${props}`, "--concurrency=4", "--crf=18"], {
  stdio: "inherit",
  env: { ...process.env, TEMP: tmp, TMP: tmp, TMPDIR: tmp },
  shell: process.platform === "win32",
});
console.log("->", out);
