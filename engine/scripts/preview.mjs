// node scripts/preview.mjs <slug> [...]  ->  ../out/preview_<slug>.jpg (one frame per beat, late in the beat)
// Needs public/reels/<slug>/timeline.json (run build_audio.py first; VOICE=stock is fine for previews).
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";

const tmp = path.resolve("..", ".cache", "tmp", "preview");
mkdirSync(tmp, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });

for (const slug of process.argv.slice(2)) {
  const tl = JSON.parse(readFileSync(`public/reels/${slug}/timeline.json`, "utf-8"));
  const comp = await selectComposition({ serveUrl, id: "Reel", inputProps: { slug } });
  const files = [];
  for (const [i, b] of tl.beats.entries()) {
    const t = i === 0 ? 0.05 : b.from + 0.8 * (b.to - b.from); // hook: frame 1, others: once the beat has built
    const output = path.join(tmp, `${slug}_${i}.png`);
    await renderStill({ composition: comp, serveUrl, inputProps: { slug }, frame: Math.round(t * 30), output, scale: 0.3 });
    files.push(output);
  }
  const out = path.join("..", "out", `preview_${slug}.jpg`);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...files.flatMap((f) => ["-i", f]), "-filter_complex", `hstack=${files.length}`, out]);
  files.forEach((f) => rmSync(f));
  console.log("->", out);
}
